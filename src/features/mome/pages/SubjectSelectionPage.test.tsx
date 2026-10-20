import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { MaterialSubject, MomePhoto } from '../domain';
import { SubjectSelectionPage } from './SubjectSelectionPage';

const blob = new Blob(['x'], { type: 'image/png' });
const photos = Array.from({ length: 7 }, (_, index): MomePhoto => ({ id: `p${index}`, sessionId: 's', fileName: `p${index}.png`, mimeType: 'image/png', width: 10, height: 10, thumbnailBlob: blob, originalBlob: blob, importedAt: index }));
const subjects = photos.map((photo, index): MaterialSubject => ({ id: `s${index}`, sourcePhotoId: photo.id, label: `Subject ${index + 1}`, description: 'Recommended', enabled: index < 5, order: index }));

describe('SubjectSelectionPage', () => {
  it('shows all recommendations but never enables more than five', async () => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:photo', revokeObjectURL: vi.fn() });
    const onChange = vi.fn();
    render(<SubjectSelectionPage photos={photos} subjects={subjects} onChange={onChange} onConfirm={vi.fn()} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.getByText('5 / 5 selected')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Subject 6/i })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: /Subject 1/i }));
    expect(onChange).toHaveBeenCalled();
  });

  it('disables Next with no enabled subjects', () => {
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:photo', revokeObjectURL: vi.fn() });
    render(<SubjectSelectionPage photos={photos} subjects={subjects.map((item) => ({ ...item, enabled: false }))} onChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
