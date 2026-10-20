import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('renders React content in a browser-like document', () => {
    render(createElement('div', null, 'MOME is ready'));

    expect(document.body).toBeDefined();
    expect(screen.getByText('MOME is ready')).toBeInTheDocument();
  });
});
