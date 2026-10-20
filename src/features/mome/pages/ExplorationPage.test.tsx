import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MomePhoto } from '../domain';
import { ExplorationPage } from './ExplorationPage';

function makePhoto(index: number): MomePhoto {
  const blob = new Blob(['image'], { type: 'image/png' });
  return { id: `photo-${index}`, sessionId: 'session', fileName: `photo-${index}.png`, mimeType: 'image/png', width: 20, height: 30, thumbnailBlob: blob, originalBlob: blob, importedAt: index };
}

describe('ExplorationPage', () => {
  it('renders 200 lazy photos in a two-column grid and registers cards', () => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: (blob: Blob) => `blob:${blob.size}`, revokeObjectURL: vi.fn() });
    const registerPhotoElement = vi.fn();
    render(<ExplorationPage photos={Array.from({ length: 200 }, (_, index) => makePhoto(index))} rejectedCount={4} registerPhotoElement={registerPhotoElement} />);
    const waterfall = screen.getByTestId('photo-waterfall');
    expect(waterfall).toHaveClass('grid-cols-2');
    expect(within(waterfall).getAllByRole('img')).toHaveLength(200);
    expect(within(waterfall).getAllByRole('img')[0]).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText(/4 photos were not imported/i)).toBeInTheDocument();
    expect(registerPhotoElement).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /start ai review/i })).toBeInTheDocument();
  });
});
