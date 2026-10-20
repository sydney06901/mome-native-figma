import type { ExplorationSuggestion } from '../domain';

export interface ExplorationPrompt {
  greeting: string;
  suggestions: ExplorationSuggestion[];
}

const MAX_GREETING = 240;
const MAX_FIELD = 160;

function boundedString(value: unknown, name: string, max = MAX_FIELD): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > max) {
    throw new Error(`Invalid onboarding field: ${name}`);
  }
  return value.trim();
}

export function parseExplorationPrompt(value: unknown): ExplorationPrompt {
  if (!value || typeof value !== 'object') throw new Error('Invalid onboarding response');
  const input = value as Record<string, unknown>;
  const greeting = boundedString(input.greeting, 'greeting', MAX_GREETING);
  if (!Array.isArray(input.suggestions) || input.suggestions.length < 2 || input.suggestions.length > 3) {
    throw new Error('Onboarding response must include 2–3 suggestions');
  }
  const suggestions = input.suggestions.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Invalid suggestion ${index}`);
    const suggestion = item as Record<string, unknown>;
    return {
      id: boundedString(suggestion.id, `suggestions[${index}].id`, 48),
      label: boundedString(suggestion.label, `suggestions[${index}].label`),
      query: boundedString(suggestion.query, `suggestions[${index}].query`),
      acknowledgement: boundedString(
        suggestion.acknowledgement,
        `suggestions[${index}].acknowledgement`,
        MAX_GREETING,
      ),
    };
  });
  return { greeting, suggestions };
}

export const NEUTRAL_EXPLORATION_PROMPT: ExplorationPrompt = {
  greeting: 'I can explore your photos with you. What would you like to find?',
  suggestions: [
    {
      id: 'buildings',
      label: 'Find buildings to turn into stickers',
      query: 'Find memorable buildings that would make good stickers',
      acknowledgement: 'Absolutely — let’s look for buildings with character.',
    },
    {
      id: 'people',
      label: 'Find memorable moments with people',
      query: 'Find warm, memorable moments with people in my photos',
      acknowledgement: 'Lovely — I’ll help you look for the moments that feel alive.',
    },
  ],
};

export async function fetchExplorationPrompt(signal?: AbortSignal): Promise<ExplorationPrompt> {
  const response = await fetch('/api/gemini/chat-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'onboarding' }),
    signal,
  });
  if (!response.ok) throw new Error(`Unable to load Memory Agent (HTTP ${response.status})`);
  return parseExplorationPrompt(await response.json());
}
