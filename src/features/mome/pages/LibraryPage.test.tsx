import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PrintableSheet } from '../domain';
import { LibraryPage } from './LibraryPage';

describe('LibraryPage', () => {
  it('renders only completed library-eligible sheets', () => {
    const sheet: PrintableSheet = { id: 'sheet-1', creationSessionId: 's', sourcePhotoIds: ['p'], subjectIds: ['x'], styleId: 'dreamy-anime', imageBlob: new Blob(['x'], { type: 'image/png' }), mimeType: 'image/png', aspectRatio: '1:4', imageSize: '2K', printWidthMm: 58, createdAt: 1, libraryEligible: true };
    render(<LibraryPage sheets={[sheet]} onOpen={() => undefined} onCreate={() => undefined} />);
    expect(screen.getByRole('heading', { name: /my little collection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open sticker sheet/i })).toBeInTheDocument();
  });
});
