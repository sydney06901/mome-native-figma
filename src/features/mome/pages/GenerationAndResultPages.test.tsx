import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PrintableSheet } from '../domain';
import { GenerationPage } from './GenerationPage';
import { ResultPage } from './ResultPage';

describe('generation and result pages', () => {
  it('shows a real error and retries only after an explicit click', () => {
    const retry = vi.fn();
    render(<GenerationPage status="error" message="429 quota exceeded" onRetry={retry} onBack={() => undefined} />);
    expect(screen.getByText(/429 quota exceeded/)).toBeInTheDocument();
    expect(retry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('offers PNG, JPG and a print placeholder for the completed physical sheet', () => {
    const sheet: PrintableSheet = { id: 'sheet', creationSessionId: 's', sourcePhotoIds: ['p'], subjectIds: ['x'], styleId: 'printmaking', imageBlob: new Blob(['x'], { type: 'image/png' }), mimeType: 'image/png', aspectRatio: '1:4', imageSize: '2K', printWidthMm: 58, createdAt: 1, libraryEligible: true };
    render(<ResultPage sheet={sheet} />);
    expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download jpg/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(screen.getByText(/raspberry pi/i)).toBeInTheDocument();
  });
});
