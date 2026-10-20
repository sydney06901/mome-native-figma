import { useEffect, useReducer, useRef, useState } from 'react';

import type { MomeAction } from '../domain';
import {
  momeRepository,
  MomeStorageError,
  type MomeRepository,
} from '../storage/momeRepository';
import { createInitialMomeSession, momeReducer } from './momeReducer';

const PERSIST_DEBOUNCE_MS = 250;

export function useMomeSession(repository: MomeRepository = momeRepository) {
  const [session, dispatch] = useReducer(momeReducer, undefined, () =>
    createInitialMomeSession(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [repositoryError, setRepositoryError] = useState<MomeStorageError | null>(null);
  const skipNextPersistenceRef = useRef(false);

  useEffect(() => {
    let active = true;
    void repository
      .loadActiveSession()
      .then((stored) => {
        if (active && stored) dispatch({ type: 'HYDRATE', session: stored });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const mapped =
          error instanceof MomeStorageError
            ? error
            : new MomeStorageError(
                'STORAGE_FAILED',
                error instanceof Error ? error.message : String(error),
              );
        setRepositoryError(mapped);
        skipNextPersistenceRef.current = true;
        dispatch({
          type: 'SET_STORAGE_ERROR',
          error: { code: mapped.code, message: mapped.message },
        });
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [repository]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersistenceRef.current) {
      skipNextPersistenceRef.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      void repository.saveSession(session).catch((error: unknown) => {
        const mapped =
          error instanceof MomeStorageError
            ? error
            : new MomeStorageError(
                'STORAGE_FAILED',
                error instanceof Error ? error.message : String(error),
              );
        setRepositoryError(mapped);
        skipNextPersistenceRef.current = true;
        dispatch({
          type: 'SET_STORAGE_ERROR',
          error: { code: mapped.code, message: mapped.message },
        });
      });
    }, PERSIST_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [hydrated, repository, session]);

  return {
    session,
    dispatch: dispatch as React.Dispatch<MomeAction>,
    hydrated,
    repositoryError,
  };
}
