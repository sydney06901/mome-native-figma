import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MATERIAL_STYLE_PRESETS } from '../services/stylePresets';
import { StyleSelectionPage } from './StyleSelectionPage';

describe('StyleSelectionPage', () => {
  it('contains exactly the four approved style IDs', () => {
    expect(MATERIAL_STYLE_PRESETS.map((preset) => preset.id)).toEqual(['printmaking', 'pixel-art', 'retro-manga-ink', 'dreamy-anime']);
  });

  it('selects locally and does not call fetch before final confirmation', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const onSelect = vi.fn();
    render(<StyleSelectionPage selectedStyleId={null} subjectCount={5} onSelect={onSelect} onConfirm={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Pixel art style/i }));
    expect(onSelect).toHaveBeenCalledWith('pixel-art');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
