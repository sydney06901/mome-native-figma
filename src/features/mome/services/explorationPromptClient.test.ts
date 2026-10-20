import { describe, expect, it } from 'vitest';

import { parseExplorationPrompt } from './explorationPromptClient';

const valid = {
  greeting: 'I can explore your photos with you.',
  suggestions: [
    { id: 'a', label: 'Find buildings', query: 'Find buildings', acknowledgement: 'Let us look!' },
    { id: 'b', label: 'Find people', query: 'Find people', acknowledgement: 'I will help!' },
  ],
};

describe('parseExplorationPrompt', () => {
  it('accepts a greeting with two or three safe suggestions', () => {
    expect(parseExplorationPrompt(valid)).toEqual(valid);
  });

  it.each([
    { ...valid, greeting: '' },
    { ...valid, suggestions: valid.suggestions.slice(0, 1) },
    { ...valid, greeting: 'x'.repeat(241) },
    { ...valid, suggestions: [...valid.suggestions, valid.suggestions[0], valid.suggestions[1]] },
  ])('rejects malformed or oversized output', (payload) => {
    expect(() => parseExplorationPrompt(payload)).toThrow();
  });
});
