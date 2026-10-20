import mainUnimpressedUrl from '../../../assets/agent/main-unimpressed.svg';
import reviewDescribingUrl from '../../../assets/agent/review-describing.svg';
import reviewMatchUrl from '../../../assets/agent/review-match.svg';
import reviewMismatchUrl from '../../../assets/agent/review-mismatch.svg';
import reviewThinkingUrl from '../../../assets/agent/review-thinking.svg';
import standbyScaredUrl from '../../../assets/agent/standby-scared.svg';

export type AgentVisualState =
  | 'main'
  | 'standby'
  | 'thinking'
  | 'describing'
  | 'mismatch'
  | 'match';

export const AGENT_ASSET_BY_STATE: Readonly<Record<AgentVisualState, string>> =
  Object.freeze({
    main: mainUnimpressedUrl,
    standby: standbyScaredUrl,
    thinking: reviewThinkingUrl,
    describing: reviewDescribingUrl,
    mismatch: reviewMismatchUrl,
    match: reviewMatchUrl,
  });

export { default as agentBubbleUrl } from '../../../assets/agent/bubble.svg';
