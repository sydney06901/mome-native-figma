export const MOME_TOKENS = Object.freeze({
  viewport: {
    maxWidth: 430,
    referenceHeight: 932,
  },
  color: {
    canvas: '#f4f1eb',
    paper: '#ffffff',
    ink: '#292832',
    mutedInk: '#a5aaa0',
    border: '#d7d1de',
    violet: '#613eea',
    pink: '#ee46d3',
    yellow: '#fdcd46',
    green: '#49f500',
    blue: '#3486f7',
    orange: '#ff8951',
  },
  radius: {
    phone: 40,
    card: 15,
    compact: 8,
  },
  shadow: {
    card: '6px 7px 4px -3px rgb(0 0 0 / 7%)',
    lifted: '0 18px 45px rgb(41 40 50 / 14%)',
  },
  type: {
    display: 56,
    title: 30,
    body: 20,
    caption: 16,
  },
  spacing: {
    edge: 20,
    control: 48,
    section: 32,
  },
} as const);

export type MomeTokens = typeof MOME_TOKENS;
