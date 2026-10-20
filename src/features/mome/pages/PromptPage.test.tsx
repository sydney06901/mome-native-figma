import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PromptPage, resetPromptCacheForTests } from './PromptPage';

const response = {
  greeting: 'I can explore your photos with you. What would you like to find?',
  suggestions: [
    { id: 'buildings', label: 'Find buildings', query: 'buildings', acknowledgement: 'Great — let us explore!' },
    { id: 'people', label: 'Find moments with people', query: 'people', acknowledgement: 'I will look with you!' },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
  resetPromptCacheForTests();
});

describe('PromptPage', () => {
  it('loads onboarding once per session and keeps it on rerender', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const props = { sessionId: 's1', query: '', acknowledgement: '', onSuggestionSelected: vi.fn(), onPhotosSelected: vi.fn() };
    const view = render(<PromptPage {...props} />);
    expect(await screen.findByText(response.greeting)).toBeInTheDocument();
    view.rerender(<PromptPage {...props} />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows acknowledgement and a separate Choose photos control after selection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));
    const onSuggestionSelected = vi.fn();
    const view = render(
      <PromptPage sessionId="s2" query="" acknowledgement="" onSuggestionSelected={onSuggestionSelected} onPhotosSelected={vi.fn()} />,
    );
    await userEvent.click(await screen.findByRole('button', { name: /Find buildings/i }));
    expect(onSuggestionSelected).toHaveBeenCalledWith(response.suggestions[0]);
    view.rerender(
      <PromptPage sessionId="s2" query="buildings" acknowledgement="Great — let us explore!" onSuggestionSelected={onSuggestionSelected} onPhotosSelected={vi.fn()} />,
    );
    expect(screen.getByText('Great — let us explore!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose photos/i })).toBeInTheDocument();
  });

  it('does nothing when the picker is cancelled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })));
    const onPhotosSelected = vi.fn();
    render(
      <PromptPage sessionId="s3" query="buildings" acknowledgement="Ready" onSuggestionSelected={vi.fn()} onPhotosSelected={onPhotosSelected} />,
    );
    const input = await waitFor(() => screen.getByLabelText('Choose photos from device'));
    fireEvent.change(input, { target: { files: [] } });
    expect(onPhotosSelected).not.toHaveBeenCalled();
  });
});
