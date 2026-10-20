import { useEffect, useRef, useState } from 'react';

import { MobileShell } from './components/MobileShell';
import type { ExplorationSuggestion, MomeCandidate, PrintableSheet } from './domain';
import { ExplorationPage } from './pages/ExplorationPage';
import { MainViewPage } from './pages/MainViewPage';
import { PromptPage } from './pages/PromptPage';
import { StyleSelectionPage } from './pages/StyleSelectionPage';
import { SubjectSelectionPage } from './pages/SubjectSelectionPage';
import { GenerationPage } from './pages/GenerationPage';
import { ResultPage } from './pages/ResultPage';
import { LibraryPage } from './pages/LibraryPage';
import { importPhotos } from './services/photoImport';
import { analyzePhotoBatch, type AnalysisResult } from './services/analysisClient';
import { runAnalysisBatches } from './review/batchScheduler';
import { VisualReviewPlayer, type ReviewPhase } from './review/visualReviewPlayer';
import { useMomeSession } from './state/useMomeSession';
import { momeRepository } from './storage/momeRepository';
import { base64ToBlob } from '../../services/materialGeneration/materialSheetClient';
import {
  buildMaterialSheetRequest,
  materialSheetGenerationController,
} from './services/generationController';

export function MomeApp() {
  const { session, dispatch } = useMomeSession();
  const [rejectedCount, setRejectedCount] = useState(0);
  const photoElements = useRef(new Map<string, HTMLElement>());
  const reviewAbort = useRef<AbortController | null>(null);
  const playerRef = useRef<VisualReviewPlayer | null>(null);
  const generationAbort = useRef<AbortController | null>(null);
  const [reviewActive, setReviewActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<string>();
  const [cursorPhase, setCursorPhase] = useState<ReviewPhase>('travelling');
  const [reviewedCount, setReviewedCount] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [librarySheets, setLibrarySheets] = useState<PrintableSheet[]>([]);

  useEffect(() => {
    if (session.screen !== 'library') return;
    void momeRepository.loadLibrarySheets().then(setLibrarySheets).catch(() => setLibrarySheets([]));
  }, [session.screen]);

  useEffect(() => {
    const canResumePending = session.generation.status === 'generating' && !generationAbort.current;
    if (session.screen !== 'generating' || (session.generation.status !== 'ready' && !canResumePending)) return;
    const controller = new AbortController();
    generationAbort.current = controller;
    void (async () => {
      try {
        const request = await buildMaterialSheetRequest(session);
        const pendingSession = {
          ...session,
          generation: { status: 'generating' as const, taskId: request.idempotencyKey },
          updatedAt: Date.now(),
        };
        dispatch({ type: 'SET_GENERATION_STATUS', status: 'generating', taskId: request.idempotencyKey });
        await momeRepository.saveSession(pendingSession);
        const response = await materialSheetGenerationController.generate(request, controller.signal);
        if (controller.signal.aborted) return;
        if (response.sheet.mimeType !== 'image/png') throw new Error(`Unexpected image format: ${response.sheet.mimeType}`);
        const sheet = {
          id: response.idempotencyKey,
          creationSessionId: session.id,
          sourcePhotoIds: request.referenceImages.map((reference) => reference.photoId),
          subjectIds: request.subjects.map((subject) => subject.id),
          styleId: request.styleId,
          imageBlob: base64ToBlob(response.sheet.base64Data, 'image/png'),
          mimeType: 'image/png' as const,
          aspectRatio: '1:4' as const,
          imageSize: '2K' as const,
          printWidthMm: 58 as const,
          createdAt: response.sheet.generatedAt,
          libraryEligible: true,
        };
        await momeRepository.saveLibrarySheet(sheet);
        generationAbort.current = null;
        dispatch({ type: 'COMPLETE_SHEET', sheet });
      } catch (error) {
        if (controller.signal.aborted) return;
        generationAbort.current = null;
        dispatch({
          type: 'SET_GENERATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })();
  }, [session.screen, session.generation.status]);

  const start = () => dispatch({ type: 'START_NEW_EXPLORATION', sessionId: crypto.randomUUID(), now: Date.now() });
  const selectSuggestion = (suggestion: ExplorationSuggestion) => dispatch({ type: 'SELECT_SUGGESTION', suggestion });

  const startReview = async () => {
    if (reviewActive || session.photos.length === 0) return;
    const controller = new AbortController();
    reviewAbort.current = controller;
    setReviewActive(true);
    setPaused(false);
    setCurrentPhotoId(undefined);
    setCursorPhase('travelling');
    setReviewedCount(0);
    setMatchedCount(0);
    dispatch({ type: 'SET_ANALYSIS', analysis: { status: 'running', reviewed: 0, total: session.photos.length, matched: 0 } });
    const totalBatches = Math.ceil(session.photos.length / 12);
    const revealedCandidates: MomeCandidate[] = [];
    let reviewed = 0;
    let matched = 0;
    const player = new VisualReviewPlayer({
      onPhase: (event) => {
        setCurrentPhotoId(event.photoId);
        setCursorPhase(event.phase);
      },
      onReveal: (result) => {
        reviewed += 1;
        if (result.match) {
          matched += 1;
          revealedCandidates.push({ photoId: result.photoId, confidence: result.confidence ?? 0, reason: result.reason ?? '', revealed: true });
        }
        setReviewedCount(reviewed);
        setMatchedCount(matched);
        dispatch({ type: 'SET_ANALYSIS', analysis: { status: 'reviewing', reviewed, total: session.photos.length, matched } });
      },
    });
    playerRef.current = player;
    const visualReview = player.playQueued(controller.signal);
    const scheduled = await runAnalysisBatches(session.photos, {
      getId: (photo) => photo.id,
      signal: controller.signal,
      analyzeBatch: (batch, batchIndex, signal) => analyzePhotoBatch(batch, {
        taskId: session.id,
        query: session.explorationQuery || 'Find memorable subjects that will work as physical journal stickers',
        batchIndex,
        totalBatches,
        signal,
      }),
      onBatchCompleted: (results) => player.enqueue(results as AnalysisResult[]),
    });
    player.closeQueue();
    await visualReview;
    if (controller.signal.aborted) return;
    if (scheduled.completed.length === 0 && scheduled.errors.length > 0) {
      playerRef.current = null;
      reviewAbort.current = null;
      setReviewActive(false);
      dispatch({ type: 'SET_ANALYSIS', analysis: { status: 'error', reviewed: 0, total: session.photos.length, matched: 0, message: scheduled.errors[0].message } });
      return;
    }
    dispatch({ type: 'SET_CANDIDATES', candidates: revealedCandidates });
    dispatch({
      type: 'SET_SUBJECTS',
      subjects: revealedCandidates.map((candidate, index) => ({
        id: `subject-${candidate.photoId}`,
        sourcePhotoId: candidate.photoId,
        label: session.photos.find((photo) => photo.id === candidate.photoId)?.fileName.replace(/\.[^.]+$/, '') || `Memory ${index + 1}`,
        description: candidate.reason || 'Recommended by Mome',
        enabled: index < 5,
        order: index,
      })),
    });
    dispatch({ type: 'SET_ANALYSIS', analysis: { status: 'completed', reviewed, total: session.photos.length, matched } });
    playerRef.current = null;
    reviewAbort.current = null;
    setReviewActive(false);
    setCurrentPhotoId(undefined);
    dispatch({ type: 'NAVIGATE', screen: 'subjects' });
  };

  return (
    <MobileShell>
      {session.screen === 'home' && <MainViewPage onStart={start} onOpenLibrary={() => dispatch({ type: 'NAVIGATE', screen: 'library' })} />}
      {session.screen === 'prompt' && (
        <PromptPage
          sessionId={session.id}
          query={session.explorationQuery}
          acknowledgement={session.agentAcknowledgement}
          onSuggestionSelected={selectSuggestion}
          onPhotosSelected={(files) => {
            void importPhotos(files, { sessionId: session.id, repository: momeRepository }).then((summary) => {
              setRejectedCount(summary.rejected.length);
              if (summary.accepted.length > 0) dispatch({ type: 'IMPORT_PHOTOS', photos: summary.accepted });
            });
          }}
          onBack={() => dispatch({ type: 'BACK_WITHIN_FLOW' })}
        />
      )}
      {session.screen === 'exploring' && (
        <ExplorationPage
          photos={session.photos}
          rejectedCount={rejectedCount}
          registerPhotoElement={(id, element) => {
            if (element) photoElements.current.set(id, element);
            else photoElements.current.delete(id);
          }}
          onBack={() => dispatch({ type: 'BACK_WITHIN_FLOW' })}
          onStartReview={() => void startReview()}
          currentPhotoId={currentPhotoId}
          cursorPhase={cursorPhase}
          targetElement={currentPhotoId ? photoElements.current.get(currentPhotoId) ?? null : null}
          reviewActive={reviewActive}
          reviewedCount={reviewedCount}
          matchedCount={matchedCount}
          paused={paused}
          onPauseToggle={() => {
            if (paused) playerRef.current?.resume();
            else playerRef.current?.pause();
            setPaused(!paused);
          }}
          onSkip={() => playerRef.current?.skip()}
          onStop={() => {
            reviewAbort.current?.abort();
            setReviewActive(false);
            setPaused(false);
            setCurrentPhotoId(undefined);
            dispatch({ type: 'SET_ANALYSIS', analysis: { status: 'cancelled', reviewed: reviewedCount, total: session.photos.length, matched: matchedCount } });
          }}
        />
      )}
      {session.screen === 'subjects' && (
        <SubjectSelectionPage
          photos={session.photos.filter((photo) => session.candidates.some((candidate) => candidate.photoId === photo.id))}
          subjects={session.subjects}
          onChange={(subjects) => dispatch({ type: 'SET_SUBJECTS', subjects })}
          onConfirm={() => dispatch({ type: 'NAVIGATE', screen: 'style' })}
          onBack={() => dispatch({ type: 'BACK_WITHIN_FLOW' })}
        />
      )}
      {session.screen === 'style' && (
        <StyleSelectionPage
          selectedStyleId={session.styleId}
          subjectCount={session.subjects.filter((subject) => subject.enabled).length}
          onSelect={(styleId) => dispatch({ type: 'SET_STYLE', styleId })}
          onConfirm={() => {
            if (session.styleId) {
              dispatch({ type: 'SET_GENERATION_STATUS', status: 'ready', taskId: session.id });
              dispatch({ type: 'NAVIGATE', screen: 'generating' });
            }
          }}
          onBack={() => dispatch({ type: 'BACK_WITHIN_FLOW' })}
        />
      )}
      {session.screen === 'generating' && (
        <GenerationPage
          status={session.generation.status === 'error' ? 'error' : session.generation.status === 'generating' ? 'generating' : 'preparing'}
          message={session.generation.status === 'error' ? session.generation.message : undefined}
          onRetry={() => dispatch({ type: 'SET_GENERATION_STATUS', status: 'ready', taskId: session.id })}
          onBack={() => {
            generationAbort.current?.abort();
            generationAbort.current = null;
            dispatch({ type: 'BACK_WITHIN_FLOW' });
          }}
        />
      )}
      {session.screen === 'result' && session.generation.status === 'completed' && (
        <ResultPage
          sheet={session.generation.sheet}
          onLibrary={() => dispatch({ type: 'NAVIGATE', screen: 'library' })}
          onCreate={start}
        />
      )}
      {session.screen === 'library' && (
        <LibraryPage
          sheets={librarySheets}
          onOpen={(sheet) => dispatch({ type: 'COMPLETE_SHEET', sheet })}
          onCreate={start}
        />
      )}
      {!['home', 'prompt', 'exploring', 'subjects', 'style', 'generating', 'result', 'library'].includes(session.screen) && (
        <div className="grid min-h-dvh place-items-center p-8 text-center sm:min-h-[884px]"><p className="font-mome-hand text-3xl">Mome is getting this page ready…</p></div>
      )}
    </MobileShell>
  );
}
