import { ArrowLeft, Mic, Pencil } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { AgentBubble } from '../components/AgentBubble';
import { MomeAgent } from '../components/MomeAgent';
import type { ExplorationSuggestion } from '../domain';
import {
  fetchExplorationPrompt,
  NEUTRAL_EXPLORATION_PROMPT,
  type ExplorationPrompt,
} from '../services/explorationPromptClient';

const promptCache = new Map<string, ExplorationPrompt>();

export function resetPromptCacheForTests() {
  promptCache.clear();
}

interface PromptPageProps {
  sessionId: string;
  query: string;
  acknowledgement: string;
  onSuggestionSelected: (suggestion: ExplorationSuggestion) => void;
  onPhotosSelected: (files: File[]) => void;
  onBack?: () => void;
}

export function PromptPage({ sessionId, query, acknowledgement, onSuggestionSelected, onPhotosSelected, onBack }: PromptPageProps) {
  const [prompt, setPrompt] = useState<ExplorationPrompt>(() => promptCache.get(sessionId) ?? NEUTRAL_EXPLORATION_PROMPT);
  const [customQuery, setCustomQuery] = useState(query);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  useEffect(() => {
    const cached = promptCache.get(sessionId);
    if (cached) {
      setPrompt(cached);
      return;
    }
    const controller = new AbortController();
    void fetchExplorationPrompt(controller.signal)
      .then((next) => {
        promptCache.set(sessionId, next);
        setPrompt(next);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        promptCache.set(sessionId, NEUTRAL_EXPLORATION_PROMPT);
        setPrompt(NEUTRAL_EXPLORATION_PROMPT);
      });
    return () => controller.abort();
  }, [sessionId]);

  const hasIntent = query.trim().length > 0 || customQuery.trim().length > 0;

  return (
    <section className="relative flex min-h-dvh flex-col px-5 pb-8 pt-[max(22px,env(safe-area-inset-top))] sm:min-h-[884px]">
      <header className="flex items-center justify-between">
        <button type="button" onClick={onBack} aria-label="Back"><ArrowLeft /></button>
        <span className="font-mome-hand text-[30px]">mome</span>
        <Pencil className="opacity-35" />
      </header>

      <div className="mt-20 flex items-end justify-center gap-4">
        <AgentBubble>{acknowledgement || prompt.greeting}</AgentBubble>
        <MomeAgent state={acknowledgement ? 'main' : 'standby'} size={100} />
      </div>

      <div className="mt-auto space-y-3">
        {!query && (
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {prompt.suggestions.map((suggestion) => (
              <button type="button" key={suggestion.id} onClick={() => onSuggestionSelected(suggestion)} className="min-w-[176px] rounded-[18px] bg-[#f7f7f7] px-4 py-3 text-left text-base leading-tight">
                {suggestion.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor={`${fileInputId}-query`} className="sr-only">What should Mome find?</label>
          <div className="flex min-h-11 flex-1 items-center rounded-full border border-black/10 bg-white px-4">
            <input id={`${fileInputId}-query`} value={customQuery} onChange={(event) => setCustomQuery(event.target.value)} placeholder="Find journaling inspiration" className="min-w-0 flex-1 bg-transparent outline-none" />
            <Mic size={18} className="opacity-50" />
          </div>
          {hasIntent && (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="min-h-11 rounded-lg bg-[#f05a24] px-4 font-semibold text-white">Choose photos</button>
          )}
        </div>

        <input ref={fileInputRef} id={fileInputId} aria-label="Choose photos from device" type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          if (files.length > 0) onPhotosSelected(files);
          event.currentTarget.value = '';
        }} />
      </div>
    </section>
  );
}
