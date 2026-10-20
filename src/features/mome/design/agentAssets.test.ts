import { describe, expect, it } from 'vitest';

import { AGENT_ASSET_BY_STATE } from './agentAssets';

describe('AGENT_ASSET_BY_STATE', () => {
  it('covers every supported visual state exactly once', () => {
    expect(Object.keys(AGENT_ASSET_BY_STATE).sort()).toEqual([
      'describing',
      'main',
      'match',
      'mismatch',
      'standby',
      'thinking',
    ]);
  });

  it('maps every state to an SVG asset', () => {
    expect(Object.values(AGENT_ASSET_BY_STATE)).toHaveLength(6);
    for (const assetUrl of Object.values(AGENT_ASSET_BY_STATE)) {
      expect(assetUrl).toMatch(/\.svg$/);
    }
  });
});
