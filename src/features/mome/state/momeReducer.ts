import type { MomeAction, MomeSession } from '../domain';

export function createInitialMomeSession(
  id: string = crypto.randomUUID(),
  now = Date.now(),
): MomeSession {
  return {
    id,
    screen: 'home',
    history: [],
    explorationQuery: '',
    agentAcknowledgement: '',
    suggestions: [],
    photos: [],
    candidates: [],
    subjects: [],
    styleId: null,
    analysis: { status: 'idle', reviewed: 0, total: 0, matched: 0 },
    generation: { status: 'idle' },
    storageError: null,
    createdAt: now,
    updatedAt: now,
  };
}

function touched(session: MomeSession): MomeSession {
  return { ...session, updatedAt: Date.now() };
}

export function momeReducer(state: MomeSession, action: MomeAction): MomeSession {
  switch (action.type) {
    case 'START_NEW_EXPLORATION': {
      const fresh = createInitialMomeSession(action.sessionId, action.now);
      return { ...fresh, screen: 'prompt', history: ['home'] };
    }
    case 'NAVIGATE':
      if (action.screen === state.screen) return state;
      return touched({ ...state, history: [...state.history, state.screen], screen: action.screen });
    case 'BACK_WITHIN_FLOW': {
      if (state.history.length === 0) return state;
      const history = state.history.slice(0, -1);
      return touched({ ...state, history, screen: state.history[state.history.length - 1] });
    }
    case 'SELECT_SUGGESTION':
      return touched({
        ...state,
        explorationQuery: action.suggestion.query,
        agentAcknowledgement: action.suggestion.acknowledgement,
      });
    case 'SET_SUGGESTIONS':
      return touched({ ...state, suggestions: action.suggestions });
    case 'IMPORT_PHOTOS':
      return touched({
        ...state,
        photos: action.photos,
        screen: action.photos.length > 0 ? 'exploring' : state.screen,
        history: action.photos.length > 0 ? [...state.history, state.screen] : state.history,
        analysis: { status: 'idle', reviewed: 0, total: action.photos.length, matched: 0 },
      });
    case 'SET_ANALYSIS':
      return touched({ ...state, analysis: action.analysis });
    case 'SET_CANDIDATES':
      return touched({ ...state, candidates: action.candidates });
    case 'SET_SUBJECTS':
      return touched({ ...state, subjects: action.subjects });
    case 'SET_STYLE':
      return touched({ ...state, styleId: action.styleId });
    case 'SET_GENERATION_STATUS':
      return touched({ ...state, generation: { status: action.status, taskId: action.taskId } });
    case 'SET_GENERATION_ERROR':
      return touched({
        ...state,
        generation: { status: 'error', taskId: action.taskId, message: action.message },
      });
    case 'COMPLETE_SHEET': {
      const sheet = { ...action.sheet, libraryEligible: true as const };
      return touched({
        ...state,
        screen: 'result',
        history: [...state.history, state.screen],
        generation: { status: 'completed', taskId: sheet.id, sheet },
      });
    }
    case 'SET_STORAGE_ERROR':
      return { ...state, storageError: action.error };
    case 'HYDRATE':
      return action.session;
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
