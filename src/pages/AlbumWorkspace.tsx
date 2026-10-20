import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Project,
  CursorVisualState,
  PhotoAnalysis,
  MemoryAgentAction,
  MaterialCreationStep,
  MaterialCreationSession,
  MaterialSourcePhoto,
  MaterialSheetSubject,
  PrintableMaterialSheet,
} from '../domain/types.ts';
import { PhotoItem } from '../models/PhotoItem.ts';
import {
  analyzePhotoBatch,
  AgentRequestError,
  AgentRequestException,
} from '../services/gemini';
import { sendChatToAgent, ChatMessage } from '../services/geminiChatAgent.ts';
import {
  chunkArray,
  DEFAULT_BATCH_SIZE,
  MAX_CONCURRENT_BATCHES,
  MAX_PHOTO_SELECTION,
} from '../features/memory-explorer/pipeline.ts';
import { BloubFloatingCursor } from '../features/memory-explorer/bloub/BloubFloatingCursor.tsx';
import { GeminiAgentBottomSheet } from '../features/memory-explorer/components/GeminiAgentBottomSheet.tsx';
import { MoodSelector } from '../features/memory-explorer/components/MoodSelector.tsx';
import { StyleSelector } from '../features/memory-explorer/components/StyleSelector.tsx';
import { DirectionConfirmation } from '../features/memory-explorer/components/DirectionConfirmation.tsx';
import { SubjectPlanConfirmation } from '../features/memory-explorer/components/SubjectPlanConfirmation.tsx';
import { PrintableSheetGenerating } from '../features/memory-explorer/components/PrintableSheetGenerating.tsx';
import { PrintableSheetReview } from '../features/memory-explorer/components/PrintableSheetReview.tsx';
import {
  generateMaterialSheet,
  blobToDataUrl,
  base64ToBlob,
  GenerateMaterialSheetRequest,
  MaterialSheetGenerationError,
} from '../services/materialGeneration/materialSheetClient.ts';
import { MOOD_OPTIONS, STYLE_OPTIONS } from '../services/materialGeneration/presets.ts';
import { storageRepository } from '../services/storage/repository.ts';
import { abortableDelay } from '../shared/utils/async.ts';
import { getPhotoBase64DataUrl } from '../shared/utils/image.ts';

import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  CheckCheck,
  Sparkles,
  Play,
  Pause,
  MessageSquare,
  FastForward,
  Square,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  RotateCcw,
  Palette,
  Layers,
  Wand2,
  Heart,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface AlbumWorkspaceProps {
  project: Project;
  photos: PhotoItem[];
  onBack: () => void;
  onProceedToReview: (selectedPhotoIds: string[], targetKeyword: string, style: string) => void;
  onImportPhotos: (files: FileList) => Promise<void>;
  onUpdateProject: (updated: Partial<Project>) => void;
}

interface CardVisualFeedback {
  state: 'observing' | 'thinking' | 'matched' | 'skipped' | 'failed' | 'idle';
  label: string;
  confidence?: number;
}

export const AlbumWorkspace: React.FC<AlbumWorkspaceProps> = ({
  project,
  photos,
  onBack,
  onImportPhotos,
  onUpdateProject,
}) => {
  // CRITICAL: Strictly exclude any demo photos (Section 1)
  const userPhotos = useMemo(() => {
    return photos.filter((photo) => photo.isDemo !== true);
  }, [photos]);

  // Candidate photo IDs selection (strictly only non-demo photo IDs)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(() => {
    const validUserIds = new Set(photos.filter((p) => p.isDemo !== true).map((p) => p.id));
    return (project.candidatePhotoIds || []).filter((id) => validUserIds.has(id));
  });

  // Section 1: Creation Workflow State
  const [creationStep, setCreationStep] = useState<MaterialCreationStep>(() => {
    return project.materialCreationStep || 'reviewingCandidates';
  });

  const [currentCreationSession, setCurrentCreationSession] = useState<MaterialCreationSession | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<string>(project.selectedMood || 'warm_nostalgia');
  const [customMoodText, setCustomMoodText] = useState<string>('');
  const [primaryStyleId, setPrimaryStyleId] = useState<string>(project.selectedPrimaryStyle || 'line_art');
  const [secondaryStyleIds, setSecondaryStyleIds] = useState<string[]>(project.selectedSecondaryStyles || []);
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [showPlanConfirmedModal, setShowPlanConfirmedModal] = useState<boolean>(false);
  const [subjectPlan, setSubjectPlan] = useState<MaterialSheetSubject[]>([]);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<{
    code?: string;
    stage?: string;
    message: string;
  } | null>(null);

  const sheetAbortControllerRef = useRef<AbortController | null>(null);

  // Confirmed candidate photos
  const selectedPhotos = useMemo(() => {
    return userPhotos.filter((photo) => selectedPhotoIds.includes(photo.id));
  }, [userPhotos, selectedPhotoIds]);

  // Import flow state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // Candidate confirmation completion notice modal state
  const [showConfirmedNotice, setShowConfirmedNotice] = useState<boolean>(false);

  // DOM refs for each photo card to compute coordinates and smooth-scroll
  const photoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const capsuleRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Tour & Visual Cursor States
  const [isRunningTour, setIsRunningTour] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');
  const [isPaused, setIsPaused] = useState(false);
  const [visualState, setVisualState] = useState<CursorVisualState>('idle');
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [activeReason, setActiveReason] = useState<string>('');
  const [activeConfidence, setActiveConfidence] = useState<number | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string>(
    userPhotos.length === 0 ? '请先导入照片' : `${userPhotos.length} 张照片已准备好`
  );

  // Progress counters
  const [inspectedCount, setInspectedCount] = useState(0);

  // Feedback for individual photo cards (glow border & status label)
  const [cardFeedback, setCardFeedback] = useState<Record<string, CardVisualFeedback>>({});

  // Structured Diagnostic Error state
  const [currentError, setCurrentError] = useState<AgentRequestError | null>(null);

  // Chat panel state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        userPhotos.length === 0
          ? '请先导入照片。导入后告诉我你想寻找什么，我会在你的相册中巡视！'
          : '我可以帮你浏览这些照片。你想让我寻找什么？',
      timestamp: Date.now(),
    },
  ]);

  // Visual Queue & Background Execution Refs
  const visualQueueRef = useRef<PhotoAnalysis[]>([]);
  const visualQueueIndexRef = useRef<number>(0);
  const isVisualPlayerActiveRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const tourAbortControllerRef = useRef<AbortController | null>(null);
  const speedRef = useRef<'normal' | 'fast'>('normal');
  const allAnalysesMapRef = useRef<Map<string, PhotoAnalysis>>(new Map());

  // Synchronize state with refs
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Clean up sheet generation abort controller on component unmount only
  useEffect(() => {
    return () => {
      sheetAbortControllerRef.current?.abort();
    };
  }, []);

  // Section 9: Reset existing demo state when no real user photos are loaded
  useEffect(() => {
    if (userPhotos.length === 0) {
      tourAbortControllerRef.current?.abort();
      setIsRunningTour(false);
      setActivePhotoId(null);
      setSelectedPhotoIds([]);
      setInspectedCount(0);
      setVisualState('idle');
      setStatusMessage('请先导入照片');
    } else if (!isRunningTour) {
      setStatusMessage(`${userPhotos.length} 张照片已准备好`);
    }
  }, [userPhotos.length]);

  /**
   * Append a model status update into the chat thread
   */
  const appendAgentMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `agent-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'model',
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  /**
   * The Visual Queue Player
   * Steps through completed Gemini analyses one photo at a time
   */
  const startVisualQueuePlayer = async (signal: AbortSignal, totalToScan: number) => {
    if (isVisualPlayerActiveRef.current) return;
    isVisualPlayerActiveRef.current = true;

    try {
      while (!signal.aborted && !isCancelledRef.current) {
        // Handle paused state
        while (isPausedRef.current && !signal.aborted && !isCancelledRef.current) {
          await abortableDelay(200, signal);
        }

        const queue = visualQueueRef.current;
        const currentIndex = visualQueueIndexRef.current;

        // If visual queue reached current end but analysis batching is still ongoing
        if (currentIndex >= queue.length) {
          if (tourAbortControllerRef.current && !tourAbortControllerRef.current.signal.aborted) {
            await abortableDelay(250, signal);
            continue;
          }
          break;
        }

        const analysis = queue[currentIndex];
        visualQueueIndexRef.current = currentIndex + 1;
        const currentPhotoNumber = currentIndex + 1;
        setInspectedCount(currentPhotoNumber);

        const currentSpeed = speedRef.current;
        const isEarlyStage = currentIndex < 10;

        // Paced timing
        const moveTime = currentSpeed === 'fast' ? 400 : isEarlyStage ? 800 : 550;
        const observeTime = currentSpeed === 'fast' ? 350 : isEarlyStage ? 800 : 450;
        const thinkTime = currentSpeed === 'fast' ? 250 : isEarlyStage ? 550 : 350;
        const resultTime = currentSpeed === 'fast' ? 350 : isEarlyStage ? 600 : 450;

        // Step 1: Travelling (Move to photo & smooth-scroll page)
        setActivePhotoId(analysis.photoId);
        setVisualState('travelling');
        setActiveReason('正在前往照片');

        const targetEl = photoRefs.current[analysis.photoId];
        if (targetEl) {
          targetEl.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'center',
          });
        }
        await abortableDelay(moveTime, signal);

        // Step 2: Observing
        setVisualState('observing');
        setActiveReason(analysis.summary || 'AI 正在观察');
        setStatusMessage(`正在观察第 ${currentPhotoNumber} / ${totalToScan} 张照片`);
        setCardFeedback((prev) => ({
          ...prev,
          [analysis.photoId]: {
            state: 'observing',
            label: 'AI 正在观察',
          },
        }));
        await abortableDelay(observeTime, signal);

        // Step 3: Thinking / Interpreting
        setVisualState('thinking');
        setActiveReason(analysis.reason || '正在理解画面');
        setCardFeedback((prev) => ({
          ...prev,
          [analysis.photoId]: {
            state: 'thinking',
            label: '正在理解画面',
          },
        }));
        await abortableDelay(thinkTime, signal);

        // Step 4: Outcome Reveal
        if (analysis.match) {
          setVisualState('matched');
          setActiveReason(analysis.reason);
          setActiveConfidence(analysis.confidence);
          const percent = Math.round((analysis.confidence || 0.85) * 100);

          setCardFeedback((prev) => ({
            ...prev,
            [analysis.photoId]: {
              state: 'matched',
              label: `候选 · ${percent}%`,
              confidence: analysis.confidence,
            },
          }));

          setSelectedPhotoIds((prev) => {
            const next = Array.from(new Set([...prev, analysis.photoId]));
            onUpdateProject({ candidatePhotoIds: next });
            setStatusMessage(`已找到 ${next.length} 张候选照片`);
            return next;
          });

          await abortableDelay(resultTime, signal);
        } else {
          setVisualState('travelling');
          setActiveReason('未命中设定特征');

          setCardFeedback((prev) => ({
            ...prev,
            [analysis.photoId]: {
              state: 'skipped',
              label: '已查看',
            },
          }));

          await abortableDelay(resultTime * 0.75, signal);
        }
      }

      // Completed all photos successfully
      if (!signal.aborted && !isCancelledRef.current) {
        setVisualState('celebrating');
        setActivePhotoId(null);
        setIsRunningTour(false);

        setSelectedPhotoIds((currentSelected) => {
          const completionMsg = `巡视完成，共找到 ${currentSelected.length} 张候选照片`;
          setStatusMessage(completionMsg);
          appendAgentMessage(
            `我已经巡视了 ${totalToScan} 张照片，找到 ${currentSelected.length} 张符合要求的候选照片。你可以继续调整选择。`
          );
          return currentSelected;
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Visual tour interrupted:', err);
      }
    } finally {
      isVisualPlayerActiveRef.current = false;
    }
  };

  /**
   * Execute real Gemini Multimodal Batch Analysis on userPhotos (Section 7, 8)
   */
  const handleStartSearchWorkflow = async (userQuery: string) => {
    // Section 7 validation
    if (userPhotos.length === 0) {
      setStatusMessage('请先导入照片');
      appendAgentMessage('请先导入照片后再开始巡视。');
      return;
    }

    const query = userQuery.trim();
    if (!query) {
      setStatusMessage('请告诉 Gemini 要寻找什么');
      appendAgentMessage('请告诉我想寻找什么内容（例如：“帮我寻找适合转化成贴图的建筑”）。');
      return;
    }

    if (isRunningTour) return;

    // Reset abort controller
    if (tourAbortControllerRef.current) {
      tourAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    tourAbortControllerRef.current = controller;

    isCancelledRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsRunningTour(true);
    setInspectedCount(0);
    setCardFeedback({});
    setCurrentError(null);

    visualQueueRef.current = [];
    visualQueueIndexRef.current = 0;
    allAnalysesMapRef.current.clear();

    onUpdateProject({ targetKeyword: query });

    setStatusMessage('正在准备照片预览');
    appendAgentMessage(`开始为你巡视相册，搜索目标：“${query}”。`);

    // Launch visual player in parallel
    startVisualQueuePlayer(controller.signal, userPhotos.length);

    try {
      const batches = chunkArray(userPhotos, DEFAULT_BATCH_SIZE);
      const totalBatches = batches.length;

      for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
        if (controller.signal.aborted || isCancelledRef.current) break;

        const slice = batches.slice(i, i + MAX_CONCURRENT_BATCHES);
        const batchPromises = slice.map(async (batch, batchSubIdx) => {
          const globalBatchIdx = i + batchSubIdx + 1;
          setStatusMessage(`正在分析第 ${globalBatchIdx} / ${totalBatches} 批`);

          // Prepare real image bytes for each photo in batch (Section 8)
          let preparedPhotos: any[];
          try {
            preparedPhotos = await Promise.all(
              batch.map(async (p) => {
                const base64Data = await getPhotoBase64DataUrl(p);
                return {
                  photoId: p.id,
                  imageData: base64Data || p.url,
                  metadata: {
                    fileName: p.name,
                    capturedAt: p.capturedAt || '日期未知',
                    tags: p.tags || [],
                    isBuilding: !!p.isBuilding,
                    description: p.description || '',
                  },
                };
              })
            );
          } catch (imgErr: any) {
            throw new AgentRequestException({
              stage: 'image_conversion',
              code: 'IMAGE_CONVERSION_ERROR',
              message: imgErr?.message || '照片预览图转换 Base64 失败',
              batchIndex: globalBatchIdx - 1,
            });
          }

          const input = {
            taskId: `task-${project.id}-${Date.now()}`,
            userQuery: query,
            batchIndex: globalBatchIdx - 1,
            totalBatches,
            photos: preparedPhotos,
          };

          const res = await analyzePhotoBatch(input);
          return res.results;
        });

        const batchResultsArray = await Promise.all(batchPromises);
        if (controller.signal.aborted || isCancelledRef.current) break;

        for (const batchRes of batchResultsArray) {
          for (const item of batchRes) {
            allAnalysesMapRef.current.set(item.photoId, item);
          }
          visualQueueRef.current.push(...batchRes);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const structuredErr: AgentRequestError =
          err instanceof AgentRequestException
            ? err.requestError
            : {
                stage: 'client_request',
                message: err?.message || '请求处理遇到未知异常',
              };

        console.error('AgentRequestError diagnosed:', structuredErr);
        setCurrentError(structuredErr);
        setStatusMessage(`分析中断（${structuredErr.stage}）`);
        appendAgentMessage(`Gemini 分析中断：${structuredErr.message}`);
        setVisualState('confused');
        setIsRunningTour(false);
      }
    }
  };

  /**
   * Dispatch action from Chatbot or Capsule
   */
  const handleDispatchAction = (action: MemoryAgentAction) => {
    switch (action.type) {
      case 'START_PHOTO_SEARCH':
        handleStartSearchWorkflow(action.query);
        break;

      case 'PAUSE_PHOTO_SEARCH':
        setIsPaused(true);
        isPausedRef.current = true;
        setVisualState('paused');
        setStatusMessage('巡视已暂停');
        appendAgentMessage('巡视已暂停');
        break;

      case 'RESUME_PHOTO_SEARCH':
        setIsPaused(false);
        isPausedRef.current = false;
        setStatusMessage(`正在观察第 ${inspectedCount} / ${userPhotos.length} 张照片`);
        break;

      case 'STOP_PHOTO_SEARCH':
        isCancelledRef.current = true;
        if (tourAbortControllerRef.current) {
          tourAbortControllerRef.current.abort();
        }
        setIsRunningTour(false);
        setVisualState('idle');
        setActivePhotoId(null);
        setStatusMessage(`巡视已停止 · 当前已选出 ${selectedPhotoIds.length} 张候选`);
        break;

      case 'SKIP_VISUAL_REVIEW':
        isCancelledRef.current = true;
        if (tourAbortControllerRef.current) {
          tourAbortControllerRef.current.abort();
        }

        // Apply all results received from Gemini so far
        const received = Array.from(allAnalysesMapRef.current.values());
        const matched = received.filter((a) => a.match).map((a) => a.photoId);

        const feedbackUpdates: Record<string, CardVisualFeedback> = {};
        for (const item of received) {
          feedbackUpdates[item.photoId] = {
            state: item.match ? 'matched' : 'skipped',
            label: item.match
              ? `候选 · ${Math.round((item.confidence || 0.85) * 100)}%`
              : '已查看',
            confidence: item.confidence,
          };
        }
        setCardFeedback((prev) => ({ ...prev, ...feedbackUpdates }));

        setSelectedPhotoIds((prev) => {
          const next = Array.from(new Set([...prev, ...matched]));
          onUpdateProject({ candidatePhotoIds: next });
          return next;
        });

        setIsRunningTour(false);
        setVisualState('idle');
        setActivePhotoId(null);
        setStatusMessage(`已跳过动画 · 共锁定 ${matched.length} 张候选照片`);
        break;
    }
  };

  /**
   * Chat message submit to Gemini Chatbot Agent
   */
  const handleSendChatMessage = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isProcessingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsProcessingChat(true);

    try {
      const response = await sendChatToAgent(
        newHistory.map((m) => ({ role: m.role, content: m.content })),
        userPhotos,
        selectedPhotoIds
      );

      const aiMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // If response indicated beginning search
      if (response.suggestedActions && response.suggestedActions.length > 0) {
        handleDispatchAction({
          type: 'START_PHOTO_SEARCH',
          query: textToSend,
        });
      }
    } catch (err: any) {
      console.error('Chat agent error:', err);
      appendAgentMessage('抱歉，与 Gemini Agent 的连接出现波动，请重试。');
    } finally {
      setIsProcessingChat(false);
    }
  };

  /**
   * Manual toggle selection override for any photo card
   */
  const handleToggleSelect = (photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const next = prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId];
      onUpdateProject({ candidatePhotoIds: next });
      return next;
    });
  };

  /**
   * File input change for importing photos (Section 3, 4, 5, 6)
   */
  const handlePhotoImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const count = Math.min(e.target.files.length, MAX_PHOTO_SELECTION);
      setIsImporting(true);
      setImportProgress({ current: 0, total: count });
      setStatusMessage('正在准备照片预览');

      try {
        await onImportPhotos(e.target.files);
        // Section 7: Do not start Gemini automatically after import
        const newTotal = userPhotos.length + count;
        const msg = `${newTotal} 张照片已准备好`;
        setStatusMessage(msg);
        appendAgentMessage(`${count} 张照片已导入完成。你想让我寻找什么？请在下方选择或输入要求后点击“开始巡视”。`);
      } catch (err) {
        console.error('Photo import error:', err);
        setStatusMessage('照片导入遇到问题，请重试');
      } finally {
        setIsImporting(false);
      }
    }
    e.target.value = '';
  };

  /**
   * Candidate confirmation button handler (Section 2)
   * 1. Stop and abort remaining visual animation.
   * 2. Preserve all completed Gemini results.
   * 3. Read selected photos from the current temporary exploration session.
   * 4. Create a new Material Creation Session.
   * 5. Copy the selected photos’ real source Blob and thumbnail Blob into that session.
   * 6. Do not depend on temporary object URLs.
   * 7. Only after the copy succeeds, transition to 'choosingMood'.
   */
  const handleConfirmCandidates = async () => {
    if (selectedPhotoIds.length === 0 || isSavingSession) return;

    // 1. Stop and abort remaining visual animation.
    if (tourAbortControllerRef.current) {
      tourAbortControllerRef.current.abort();
    }
    setIsRunningTour(false);
    setActivePhotoId(null);
    setVisualState('celebrating');

    // Transition to confirming state
    setCreationStep('confirmingSelection');
    setIsSavingSession(true);
    setStatusMessage(`正在锁定 ${selectedPhotoIds.length} 张候选照片并保存副本...`);

    try {
      const sessionId = `mcs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const selectedPhotosList = userPhotos.filter((p) => selectedPhotoIds.includes(p.id));

      // 3, 4, 5, 6: Read selected photos and copy real Blobs into MaterialSourcePhoto records
      const sourcePhotosToSave: MaterialSourcePhoto[] = [];

      for (const photo of selectedPhotosList) {
        const asset = await storageRepository.getPhotoAsset(photo.id);
        let origBlob: Blob | undefined = asset?.originalBlob;
        let thumbBlob: Blob | undefined = asset?.thumbnailBlob;

        // Ensure real Blob exists (not depending on temporary object URLs)
        if (!(origBlob instanceof Blob)) {
          const fetchUrl = asset?.objectUrl || photo.url;
          if (fetchUrl) {
            try {
              const res = await fetch(fetchUrl);
              origBlob = await res.blob();
            } catch {
              origBlob = new Blob([], { type: asset?.mimeType || 'image/jpeg' });
            }
          } else {
            origBlob = new Blob([], { type: 'image/jpeg' });
          }
        }

        if (!(thumbBlob instanceof Blob)) {
          const thumbUrl = asset?.thumbnailUrl || photo.url;
          if (thumbUrl && thumbUrl !== asset?.objectUrl) {
            try {
              const res = await fetch(thumbUrl);
              thumbBlob = await res.blob();
            } catch {
              thumbBlob = origBlob;
            }
          } else {
            thumbBlob = origBlob;
          }
        }

        const analysis = allAnalysesMapRef.current.get(photo.id) || asset?.analysis;

        sourcePhotosToSave.push({
          id: `msp-${sessionId}-${photo.id}`,
          creationSessionId: sessionId,
          originalPhotoId: photo.id,
          fileName: asset?.fileName || `${photo.name}.jpg`,
          mimeType: asset?.mimeType || 'image/jpeg',
          originalBlob: origBlob,
          thumbnailBlob: thumbBlob || origBlob,
          width: photo.width || 800,
          height: photo.height || 600,
          analysisSummary: analysis?.summary || photo.description,
          detectedSubjects: analysis?.detectedSubjects || photo.tags,
        });
      }

      // Persist real Blobs into IndexedDB
      await storageRepository.saveMaterialSourcePhotos(sourcePhotosToSave);

      // Create new MaterialCreationSession record
      const newSession: MaterialCreationSession = {
        id: sessionId,
        sourceExploreSessionId: project.id,
        selectedPhotoIds: [...selectedPhotoIds],
        selectedMoodIds: [selectedMoodId],
        selectedStyleId: primaryStyleId,
        status: 'choosing_preferences',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await storageRepository.saveCreationSession(newSession);
      setCurrentCreationSession(newSession);

      onUpdateProject({
        candidatePhotoIds: selectedPhotoIds,
        materialCreationStep: 'choosingMood',
        selectedMood: selectedMoodId,
        selectedPrimaryStyle: primaryStyleId,
      });

      // 7. Only after the copy succeeds, transition to next screen ('choosingMood')
      setCreationStep('choosingMood');
      setStatusMessage(`已锁定 ${selectedPhotoIds.length} 张候选照片 · 请选择心情氛围`);

      // Agent asks for mood
      const moodPromptMsg: ChatMessage = {
        id: `agent-mood-${Date.now()}`,
        role: 'model',
        content: `太棒了！已为你保留并锁定了这 ${selectedPhotoIds.length} 张真实照片。这组记忆让你想到了怎样的心情或氛围？请在下方挑选一个。`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, moodPromptMsg]);
    } catch (err) {
      console.error('Failed to create MaterialCreationSession:', err);
      setStatusMessage('候选照片锁定失败，请重试');
      setCreationStep('reviewingCandidates');
    } finally {
      setIsSavingSession(false);
    }
  };

  /**
   * Transition from Mood to Style
   */
  const handleProceedToStyle = async () => {
    if (currentCreationSession) {
      const updated: MaterialCreationSession = {
        ...currentCreationSession,
        selectedMoodIds: [selectedMoodId],
        updatedAt: Date.now(),
      };
      await storageRepository.saveCreationSession(updated);
      setCurrentCreationSession(updated);
    }
    onUpdateProject({
      selectedMood: selectedMoodId,
      materialCreationStep: 'choosingStyle',
    });
    setCreationStep('choosingStyle');
    setStatusMessage('请为手账素材挑选艺术风格');

    const moodObj = MOOD_OPTIONS.find((m) => m.id === selectedMoodId);
    const moodTitle = selectedMoodId === 'custom' ? (customMoodText || '自定义心情') : (moodObj?.title || selectedMoodId);

    const stylePromptMsg: ChatMessage = {
      id: `agent-style-${Date.now()}`,
      role: 'model',
      content: `好品味！已设定心情氛围为「${moodTitle}」。现在请为手账素材挑选艺术风格。主风格将决定线条与质感，辅助风格丰富视觉层次。`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, stylePromptMsg]);
  };

  /**
   * Transition from Style to Confirmation
   */
  const handleProceedToReady = async () => {
    if (currentCreationSession) {
      const updated: MaterialCreationSession = {
        ...currentCreationSession,
        selectedStyleId: primaryStyleId,
        status: 'ready',
        updatedAt: Date.now(),
      };
      await storageRepository.saveCreationSession(updated);
      setCurrentCreationSession(updated);
    }
    onUpdateProject({
      selectedPrimaryStyle: primaryStyleId,
      selectedSecondaryStyles: secondaryStyleIds,
      materialCreationStep: 'readyToGenerate',
    });
    setCreationStep('readyToGenerate');
    setStatusMessage('制作方案已就绪 · 点击确认方案');

    const primaryStyleObj = STYLE_OPTIONS.find((s) => s.id === primaryStyleId);

    const readyPromptMsg: ChatMessage = {
      id: `agent-ready-${Date.now()}`,
      role: 'model',
      content: `制作方案已准备就绪！共锁定 ${selectedPhotoIds.length} 张照片，设定主风格「${primaryStyleObj?.name || primaryStyleId}」。原图与预览副本均已保存在本地数据库中。请确认方案！`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, readyPromptMsg]);
  };

  /**
   * Transition from DirectionConfirmation to Confirming Subjects Plan
   * Prepares up to 5 recommended material subjects from candidate photos.
   * Does NOT call paid generation models yet.
   */
  const handleBeginSubjectPlanning = () => {
    const candidateList = userPhotos.filter((p) => selectedPhotoIds.includes(p.id));
    const targetPhotos = candidateList.length > 0 ? candidateList.slice(0, 5) : userPhotos.slice(0, 5);

    const initialSubjects: MaterialSheetSubject[] = targetPhotos.map((photo, index) => {
      const analysis = allAnalysesMapRef.current.get(photo.id);
      const mainSubject = analysis?.detectedSubjects?.[0] || photo.tags?.[0] || photo.name || `主体 ${index + 1}`;
      const desc = analysis?.summary || photo.description || (photo.tags && photo.tags.length > 0 ? photo.tags.join(' · ') : '精选手账素材元素');
      const reason = analysis?.reason || (photo.isBuilding ? '代表性建筑与空间轮廓' : '画面构图明晰，适合提取手账剪纸与线稿');

      return {
        id: `subj-${photo.id}-${index}`,
        sourcePhotoId: photo.id,
        title: mainSubject,
        description: desc,
        reason: reason,
        enabled: true,
      };
    });

    setSubjectPlan(initialSubjects);
    setCreationStep('confirmingSubjects');
    setStatusMessage(`AI 推荐了 ${initialSubjects.length} 个主要素材对象 · 请核对`);

    onUpdateProject({
      materialCreationStep: 'confirmingSubjects',
    });

    const agentMsg: ChatMessage = {
      id: `agent-subj-${Date.now()}`,
      role: 'model',
      content: `已从选定的照片池中为你提炼了 ${initialSubjects.length} 个主要素材对象！请在列表中勾选或替换，确认后即可开始制作实体手账打印页。`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, agentMsg]);
  };

  /**
   * Cancel ongoing sheet generation via AbortController
   */
  const handleCancelSheetGeneration = () => {
    if (sheetAbortControllerRef.current) {
      sheetAbortControllerRef.current.abort();
    }
  };

  /**
   * User confirms the final subjects plan and generates 1 printable sheet
   * Strictly connects to POST /api/gemini/generate-material-sheet
   */
  const handleConfirmSubjects = async () => {
    // 1. Guard against duplicate calls
    if (isGeneratingSheet) return;

    // 2. Get enabled subjects (1-5)
    const enabledSubjects = subjectPlan.filter((subject) => subject.enabled).slice(0, 5);

    // 3. Validation: 1-5 subjects
    if (enabledSubjects.length < 1 || enabledSubjects.length > 5) {
      const err = {
        message: `请选择 1 到 5 个主要素材对象（当前已选: ${enabledSubjects.length}）`,
        code: 'INVALID_SUBJECT_COUNT',
        stage: 'validation',
      };
      setSheetError(err);
      setCreationStep('error');
      return;
    }

    // 4. Session existence check
    if (!currentCreationSession) {
      const err = {
        message: '无法找到当前的素材创作会话，请返回重新选择照片并进入。',
        code: 'SESSION_NOT_FOUND',
        stage: 'initialization',
      };
      setSheetError(err);
      setCreationStep('error');
      return;
    }

    // 5. Update session status to generating and save plan
    const sessionWithGenerating: MaterialCreationSession = {
      ...currentCreationSession,
      status: 'generating',
      subjectPlan: enabledSubjects,
      generationError: undefined,
      updatedAt: Date.now(),
    };
    await storageRepository.saveCreationSession(sessionWithGenerating).catch(console.error);
    setCurrentCreationSession(sessionWithGenerating);

    // 6. Set flags & step
    setIsGeneratingSheet(true);
    setSheetError(null);
    setCreationStep('generatingSheet');

    // 7. Create new AbortController
    const controller = new AbortController();
    sheetAbortControllerRef.current = controller;

    try {
      // 8. Read stored photos from IndexedDB
      const sourcePhotos = await storageRepository.getMaterialSourcePhotos(currentCreationSession.id);
      const sourcePhotoMap = new Map<string, MaterialSourcePhoto>();
      for (const sp of sourcePhotos) {
        sourcePhotoMap.set(sp.originalPhotoId, sp);
      }

      // Verify each enabled subject has a corresponding source photo
      for (const subject of enabledSubjects) {
        if (!sourcePhotoMap.has(subject.sourcePhotoId)) {
          throw new MaterialSheetGenerationError(
            `未能在本地存储中找到对象 "${subject.title}" 对应的来源照片数据 (photoId: ${subject.sourcePhotoId})`,
            'SOURCE_PHOTO_MISSING',
            'preparation'
          );
        }
      }

      // Build reference images (max 5, no duplicates, from real Blobs)
      const referenceImages: Array<{
        photoId: string;
        mimeType: string;
        imageData: string;
      }> = [];

      const seenPhotoIds = new Set<string>();

      for (const subject of enabledSubjects) {
        if (seenPhotoIds.has(subject.sourcePhotoId)) continue;
        seenPhotoIds.add(subject.sourcePhotoId);

        const sourcePhoto = sourcePhotoMap.get(subject.sourcePhotoId)!;
        const blob =
          sourcePhoto.thumbnailBlob instanceof Blob
            ? sourcePhoto.thumbnailBlob
            : sourcePhoto.originalBlob;

        const mimeType = blob.type || sourcePhoto.mimeType || 'image/jpeg';
        const imageData = await blobToDataUrl(blob);

        referenceImages.push({
          photoId: subject.sourcePhotoId,
          mimeType,
          imageData,
        });

        if (referenceImages.length >= 5) break;
      }

      // Construct request payload
      const requestPayload: GenerateMaterialSheetRequest = {
        creationSessionId: currentCreationSession.id,
        mood: selectedMoodId === 'custom' ? customMoodText : selectedMoodId,
        primaryStyle: primaryStyleId,
        secondaryStyles: secondaryStyleIds,
        subjects: enabledSubjects.map((s) => ({
          id: s.id,
          sourcePhotoId: s.sourcePhotoId,
          title: s.title,
          description: s.description,
        })),
        referenceImages,
      };

      // 9. Single API call
      const response = await generateMaterialSheet(requestPayload, controller.signal);

      // 10. Process successful result
      const imageBlob = base64ToBlob(
        response.sheet.base64Data,
        response.sheet.mimeType
      );

      const printableSheet: PrintableMaterialSheet = {
        id: `sheet-${currentCreationSession.id}-${Date.now()}`,
        creationSessionId: currentCreationSession.id,
        sourcePhotoIds: enabledSubjects.map((subject) => subject.sourcePhotoId),
        subjects: enabledSubjects,
        mood: selectedMoodId === 'custom' ? customMoodText : selectedMoodId,
        primaryStyle: primaryStyleId,
        secondaryStyles: secondaryStyleIds,
        imageBlob,
        mimeType: response.sheet.mimeType,
        createdAt: response.sheet.generatedAt,
      };

      const updatedSession: MaterialCreationSession = {
        ...currentCreationSession,
        subjectPlan: enabledSubjects,
        printableSheet,
        status: 'reviewing',
        generationError: undefined,
        updatedAt: Date.now(),
      };

      await storageRepository.saveCreationSession(updatedSession);
      setCurrentCreationSession(updatedSession);
      setCreationStep('reviewingSheet');
    } catch (err: unknown) {
      // AbortError handling: return to confirmingSubjects without showing normal error
      if (
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err as Error)?.name === 'AbortError'
      ) {
        setCreationStep('confirmingSubjects');
        return;
      }

      const errorObj = err instanceof Error ? err : new Error(String(err));
      const customErr = err instanceof MaterialSheetGenerationError ? err : null;

      const failureError = {
        code: customErr?.code,
        stage: customErr?.stage || 'generation',
        message: errorObj.message || '素材页生成失败，请重试',
      };

      setSheetError(failureError);

      if (currentCreationSession) {
        const failedSession: MaterialCreationSession = {
          ...currentCreationSession,
          status: 'failed',
          generationError: failureError,
          updatedAt: Date.now(),
        };
        await storageRepository.saveCreationSession(failedSession).catch(console.error);
        setCurrentCreationSession(failedSession);
      }

      setCreationStep('error');
    } finally {
      setIsGeneratingSheet(false);
      sheetAbortControllerRef.current = null;
    }
  };


  // Section 2: Initial Empty Import State (When userPhotos.length === 0)
  if (userPhotos.length === 0) {
    return (
      <div className="min-h-full flex flex-col justify-between p-4 bg-[#fbfaf7] select-none">
        {/* Top Header */}
        <div className="flex items-center gap-2 h-12">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-1.5 rounded-xl flex items-center justify-center text-[#7c756d] hover:text-[#1c1a18] active:scale-95 transition-transform"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-[#1c1a18]">探索记忆</span>
        </div>

        {/* Center Import Card (Section 2, 3) */}
        <div className="my-auto py-8 px-5 rounded-3xl bg-white border border-[#eae4d8] shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#ddf3e9] border border-[#72c9a3]/30 flex items-center justify-center mx-auto shadow-xs">
            <Upload className="w-8 h-8 text-[#2b7354]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#1c1a18] tracking-tight">
              导入你的真实照片
            </h2>
            <p className="text-xs text-[#6e6860] leading-relaxed max-w-[280px] mx-auto">
              选择相册照片后，Gemini 才会根据你的要求开始浏览和分析。
            </p>
          </div>

          {/* Real file input (Section 3: no capture="camera", opens photo library) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={handlePhotoImport}
          />

          {/* Primary Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full min-h-[48px] rounded-2xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-[#eed8be]" />
            <span>{isImporting ? '正在准备照片...' : '从相册导入照片'}</span>
          </button>

          {/* Import Progress (Section 5) */}
          {isImporting && (
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-[#f0ece4] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3b6e8c] h-full transition-all duration-200 rounded-full"
                  style={{
                    width: `${
                      importProgress.total > 0
                        ? (importProgress.current / importProgress.total) * 100
                        : 20
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#7c756d] font-mono">
                正在导入 {importProgress.current} / {importProgress.total} 张照片
              </p>
            </div>
          )}

          {/* Supporting Information (Section 2) */}
          <div className="pt-2 border-t border-[#f0ece4] space-y-1 text-left text-[11px] text-[#7c756d]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6e8c]" />
              <span>支持 JPG、PNG、WEBP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6e8c]" />
              <span>一次最多选择 300 张</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6e8c]" />
              <span>原始照片不会被修改</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6e8c]" />
              <span>Gemini 只分析经过压缩的预览图</span>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    );
  }

  // Section 6: Display Real Imported Photos
  return (
    <div className="min-h-full pb-28 bg-[#fbfaf7] relative select-none">
      {/* Real file input for appending photos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handlePhotoImport}
      />

      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#fdfcf9]/95 backdrop-blur-md border-b border-[#eeeae2] px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (creationStep === 'reviewingCandidates' || creationStep === 'confirmingSelection') {
                onBack();
              } else if (creationStep === 'choosingMood') {
                setCreationStep('reviewingCandidates');
              } else if (creationStep === 'choosingStyle') {
                setCreationStep('choosingMood');
              } else if (creationStep === 'readyToGenerate') {
                setCreationStep('choosingStyle');
              } else if (creationStep === 'confirmingSubjects') {
                setCreationStep('readyToGenerate');
              } else if (creationStep === 'generatingSheet') {
                handleCancelSheetGeneration();
              } else if (creationStep === 'reviewingSheet' || creationStep === 'error') {
                setCreationStep('confirmingSubjects');
              }
            }}
            className="w-10 h-10 -ml-1.5 rounded-xl flex items-center justify-center text-[#7c756d] hover:text-[#1c1a18] active:scale-95 transition-transform cursor-pointer"
            aria-label="返回"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs font-semibold text-[#1c1a18] truncate tracking-tight">
              {creationStep === 'reviewingCandidates'
                ? project.name || '我的手账记忆'
                : creationStep === 'confirmingSelection'
                ? '正在锁定照片'
                : creationStep === 'choosingMood'
                ? '步骤 1/4 · 选择心情氛围'
                : creationStep === 'choosingStyle'
                ? '步骤 2/4 · 挑选艺术风格'
                : creationStep === 'readyToGenerate'
                ? '步骤 3/4 · 制作方案确认'
                : creationStep === 'confirmingSubjects'
                ? '步骤 4/4 · 确认主要素材对象'
                : creationStep === 'generatingSheet'
                ? '正在生成素材页'
                : creationStep === 'reviewingSheet'
                ? '打印素材页已生成'
                : '生成失败 · 待处理'}
            </h1>
            <p className="text-[10px] text-[#8e877e] truncate font-normal tracking-tight">
              {creationStep === 'reviewingCandidates'
                ? `相册工作台 · 共 ${userPhotos.length} 张照片`
                : creationStep === 'confirmingSelection'
                ? '正在安全保存素材副本...'
                : creationStep === 'choosingMood'
                ? `已锁定 ${selectedPhotoIds.length} 张候选照片`
                : creationStep === 'choosingStyle'
                ? '设定主风格与辅助质感'
                : creationStep === 'readyToGenerate'
                ? '方案已锁定 · 准备生成'
                : creationStep === 'confirmingSubjects'
                ? `AI 精选推荐 ${subjectPlan.length} 个主要对象`
                : creationStep === 'generatingSheet'
                ? '单次高清图片模型合成中'
                : creationStep === 'reviewingSheet'
                ? '单张 A4 打印贴纸页已就绪'
                : '请检查错误原因后重试'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {creationStep === 'reviewingCandidates' ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[34px] px-2.5 rounded-lg border border-[#e4ded4] bg-white hover:bg-[#faf8f4] text-[#504a44] text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="加照片"
            >
              <Plus className="w-3 h-3 text-[#3b6e8c]" />
              <span>加照片</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3b6e8c]/10 text-[#3b6e8c] text-[10px] font-semibold border border-[#3b6e8c]/20">
              <Sparkles className="w-3 h-3" />
              <span>{selectedPhotoIds.length} 张入选</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Cursor for photo inspection */}
      <BloubFloatingCursor
        visualState={visualState}
        targetElement={activePhotoId ? photoRefs.current[activePhotoId] || null : null}
        anchorElement={capsuleRef.current}
        visible={creationStep === 'reviewingCandidates' && isRunningTour && !!activePhotoId}
        speed={speed}
        currentReason={activeReason}
        confidence={activeConfidence}
      />

      {/* Gemini Agent Capsule */}
      <div
        ref={capsuleRef}
        className="sticky top-12 z-20 px-3.5 pt-1.5 pb-2 pointer-events-none flex justify-center"
      >
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fdfcf9]/95 backdrop-blur-xl border border-[#eeeae2] shadow-[0_4px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_22px_rgba(59,110,140,0.14)] transition-all duration-300">
          {/* Avatar button */}
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#2c2825] to-[#141312] text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-black/10 active:scale-90 transition-transform cursor-pointer"
            title="点击展开 Gemini 聊天面板"
          >
            <div
              className={`absolute -inset-1 rounded-full transition-opacity duration-500 ${
                visualState === 'thinking'
                  ? 'bg-[#d97706]/40 animate-pulse'
                  : visualState === 'matched'
                  ? 'bg-[#15803d]/40 animate-pulse'
                  : isRunningTour
                  ? 'bg-[#3b6e8c]/35 animate-ping'
                  : 'bg-transparent'
              }`}
            />
            <div className="relative z-10 flex items-center gap-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  visualState === 'thinking'
                    ? 'scale-125 bg-[#fed7aa] animate-bounce'
                    : visualState === 'matched'
                    ? 'scale-110 bg-[#bbf7d0]'
                    : 'bg-white/95'
                }`}
              />
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  visualState === 'thinking'
                    ? 'scale-125 bg-[#fed7aa] animate-bounce delay-75'
                    : visualState === 'matched'
                    ? 'scale-110 bg-[#bbf7d0]'
                    : 'bg-white/95'
                }`}
              />
            </div>
          </button>

          {/* Text and status info */}
          <div
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 min-w-0 pr-0.5 cursor-pointer select-none"
          >
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-[#1c1a18] tracking-tight shrink-0">
                  {isRunningTour ? 'AI 巡视中' : 'Gemini Agent'}
                </span>
                {isRunningTour && (
                  <span className="text-[9px] font-mono text-[#7c756d] bg-[#f0ece4] px-1.5 py-0.2 rounded-full">
                    {inspectedCount}/{userPhotos.length}
                  </span>
                )}
                {selectedPhotoIds.length > 0 && (
                  <span className="text-[9px] font-semibold text-[#3b6e8c] bg-[#3b6e8c]/10 px-1.5 py-0.2 rounded-full">
                    候选 {selectedPhotoIds.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#7c756d] font-normal truncate max-w-[130px]">
                {statusMessage}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {isRunningTour && (
              <button
                type="button"
                onClick={() => setSpeed((prev) => (prev === 'normal' ? 'fast' : 'normal'))}
                className={`px-1.5 h-5 rounded-full text-[9px] font-mono font-bold transition-all ${
                  speed === 'fast'
                    ? 'bg-[#3b6e8c] text-white shadow-xs'
                    : 'bg-[#f4f0e8] text-[#7c756d]'
                }`}
                title="切换速度"
              >
                {speed === 'fast' ? '2×' : '1×'}
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                handleDispatchAction(
                  isRunningTour && !isPaused
                    ? { type: 'PAUSE_PHOTO_SEARCH' }
                    : isPaused
                    ? { type: 'RESUME_PHOTO_SEARCH' }
                    : { type: 'START_PHOTO_SEARCH', query: project.targetKeyword || '寻找适合做手账的素材' }
                )
              }
              className="w-5 h-5 rounded-full bg-[#f4f0e8] text-[#7c756d] hover:text-[#1c1a18] flex items-center justify-center active:scale-90 cursor-pointer"
            >
              {isRunningTour && !isPaused ? (
                <Pause className="w-2.5 h-2.5" />
              ) : (
                <Play className="w-2.5 h-2.5 ml-0.2 fill-current" />
              )}
            </button>

            {isRunningTour && (
              <>
                <button
                  type="button"
                  onClick={() => handleDispatchAction({ type: 'SKIP_VISUAL_REVIEW' })}
                  className="w-5 h-5 rounded-full bg-[#f4f0e8] text-[#7c756d] hover:text-[#3b6e8c] flex items-center justify-center active:scale-90 cursor-pointer"
                  title="跳过动画"
                >
                  <FastForward className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatchAction({ type: 'STOP_PHOTO_SEARCH' })}
                  className="w-5 h-5 rounded-full bg-[#faeeec] text-[#b34033] flex items-center justify-center active:scale-90 cursor-pointer"
                  title="停止"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                </button>
              </>
            )}

            {!isRunningTour && (
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="w-5 h-5 rounded-full bg-[#f4f0e8] text-[#7c756d] flex items-center justify-center active:scale-90 cursor-pointer"
                title="打开聊天"
              >
                <MessageSquare className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Development Diagnostic Panel below Capsule */}
      {currentError && (
        <div className="mx-3.5 mb-2.5 p-3 rounded-2xl bg-[#fff8eb] border border-[#fde1ad] text-[#5c3e14] shadow-xs space-y-1.5 select-text">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-xs text-[#854d0e]">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
              Gemini 诊断报告
            </span>
            <button
              type="button"
              onClick={() => setCurrentError(null)}
              className="text-[10px] text-[#a16207] hover:text-[#713f12] px-2 py-0.5 rounded-full hover:bg-[#fed7aa]/40 cursor-pointer"
            >
              关闭
            </button>
          </div>
          <div className="font-mono text-[11px] space-y-0.5 text-[#78350f] leading-snug">
            <div>失败阶段：<span className="font-bold text-[#451a03]">{currentError.stage}</span></div>
            <div>HTTP：<span className="font-bold text-[#451a03]">{currentError.status ?? '—'}</span></div>
            <div>代码：<span className="font-bold text-[#451a03]">{currentError.code || '—'}</span></div>
            <div className="break-words">原因：<span className="font-sans font-medium text-[#78350f]">{currentError.message}</span></div>
          </div>
        </div>
      )}

      {/* SCREEN 1: Reviewing Candidates (Photo Stream Grid) */}
      {creationStep === 'reviewingCandidates' && (
        <>
          <div className="px-3 pt-0.5">
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {userPhotos.map((photo, index) => {
                  const isSelected = selectedPhotoIds.includes(photo.id);
                  const isCurrentlyActive = activePhotoId === photo.id;
                  const feedback = cardFeedback[photo.id];

                  return (
                    <motion.div
                      key={photo.id}
                      id={`photo-card-${photo.id}`}
                      ref={(el) => {
                        photoRefs.current[photo.id] = el;
                      }}
                      layout
                      onClick={() => handleToggleSelect(photo.id)}
                      className={`relative group rounded-2xl overflow-hidden bg-white cursor-pointer select-none transition-all duration-300 aspect-[4/3] ${
                        isCurrentlyActive
                          ? feedback?.state === 'matched'
                            ? 'ring-2.5 ring-[#15803d] shadow-md scale-[1.01]'
                            : 'ring-2.5 ring-[#3b6e8c] shadow-md scale-[1.01]'
                          : isSelected
                          ? 'ring-2 ring-[#3b6e8c] shadow-xs'
                          : 'border border-[#ebe6dd] shadow-2xs hover:border-[#ded8cc] active:scale-[0.98]'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading={index < 8 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

                      {/* Selection Checkmark Button (Top Right) */}
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#3b6e8c] text-white shadow-xs ring-1.5 ring-white'
                              : 'bg-black/35 text-white/70 backdrop-blur-xs border border-white/30'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full border border-white/60" />
                          )}
                        </div>
                      </div>

                      {/* Active AI Status Feedback Badge (Top Left) */}
                      {isCurrentlyActive && feedback && (
                        <div
                          className={`absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium backdrop-blur-xs shadow-xs border border-white/20 animate-in fade-in duration-150 ${
                            feedback.state === 'matched'
                              ? 'bg-[#15803d]/90 text-white'
                              : feedback.state === 'thinking'
                              ? 'bg-[#d97706]/90 text-white'
                              : 'bg-[#1c1a18]/90 text-white'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              feedback.state === 'matched'
                                ? 'bg-[#86efac]'
                                : feedback.state === 'thinking'
                                ? 'bg-[#fde047] animate-ping'
                                : 'bg-[#67e8f9] animate-pulse'
                            }`}
                          />
                          <span className="truncate max-w-[80px]">{feedback.label}</span>
                        </div>
                      )}

                      {/* Selected Candidate Badge (When not active) */}
                      {isSelected && !isCurrentlyActive && (
                        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#3b6e8c]/90 text-white backdrop-blur-xs text-[9px] font-medium border border-white/20">
                          <Sparkles className="w-2.5 h-2.5 text-[#eed8be]" />
                          <span>候选</span>
                        </div>
                      )}

                      {/* Photo Title Footer */}
                      <div className="absolute bottom-1.5 left-2 right-2 text-white pointer-events-none flex items-center justify-between">
                        <p className="text-[11px] font-medium text-white truncate drop-shadow-sm pr-1">
                          {photo.name}
                        </p>
                        {photo.capturedAt && (
                          <span className="text-[9px] text-white/80 font-mono shrink-0">
                            {photo.capturedAt}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky Bottom Bar for Reviewing Candidates */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#fbfaf7] via-[#fbfaf7]/95 to-transparent z-20 flex gap-2.5 max-w-[430px] mx-auto">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="flex-1 min-h-[44px] rounded-xl bg-white border border-[#ded8cc] text-[#1c1a18] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#f6f4ee] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3b6e8c]" />
              <span>对话分配任务</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmCandidates}
              disabled={selectedPhotoIds.length === 0 || isSavingSession}
              className="flex-1 min-h-[44px] rounded-xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md disabled:opacity-40 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#eed8be]" />
              <span>确认候选照片（{selectedPhotoIds.length}）</span>
            </button>
          </div>
        </>
      )}

      {/* SCREEN 2: Confirming Selection (Saving blobs to IndexedDB) */}
      {creationStep === 'confirmingSelection' && (
        <div className="px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#ddf3e9] flex items-center justify-center text-[#2b7354] animate-pulse shadow-sm">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1c1a18]">
              正在锁定所选照片并保存副本
            </h3>
            <p className="text-xs text-[#7c756d] max-w-xs mx-auto leading-relaxed">
              已将所选 {selectedPhotoIds.length} 张照片的真实文件与缩略图安全写入本地素材会话数据库...
            </p>
          </div>
        </div>
      )}

      {/* SCREEN 3: Choosing Mood */}
      {creationStep === 'choosingMood' && (
        <div className="space-y-3.5">
          {/* Confirmed Candidate Photos Preview (Unselected photos disappear!) */}
          <div className="px-3.5">
            <div className="p-3 rounded-2xl bg-white border border-[#eae5dc] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1c1a18]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3b6e8c]" />
                  <span>已锁定候选记忆（{selectedPhotos.length} 张）</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCreationStep('reviewingCandidates')}
                  className="text-[11px] text-[#3b6e8c] hover:underline font-normal cursor-pointer"
                >
                  重新调整
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e4ded4] bg-[#f5f2eb] relative shadow-2xs"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Prompt Capsule */}
          <div className="px-3.5">
            <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#eee6da] flex items-start gap-2.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#1c1a18] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-[#eed8be]" />
              </div>
              <div className="text-xs text-[#423d38] leading-relaxed">
                已锁定 <strong className="text-[#1c1a18]">{selectedPhotos.length}</strong> 张真实照片。这组记忆让你想到了怎样的心情或氛围？请选择一个。
              </div>
            </div>
          </div>

          {/* Mood Selector Component */}
          <div className="px-3.5">
            <MoodSelector
              selectedMood={selectedMoodId}
              onSelectMood={(moodId) => setSelectedMoodId(moodId)}
              customMoodText={customMoodText}
              onChangeCustomMood={(txt) => setCustomMoodText(txt)}
            />
          </div>

          {/* Sticky Bottom Bar for Mood Step */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#fbfaf7] via-[#fbfaf7]/95 to-transparent z-20 flex gap-2.5 max-w-[430px] mx-auto">
            <button
              type="button"
              onClick={() => setCreationStep('reviewingCandidates')}
              className="flex-1 min-h-[44px] rounded-xl bg-white border border-[#ded8cc] text-[#504a44] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#f6f4ee] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#7c756d]" />
              <span>重选照片</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToStyle}
              className="flex-2 min-h-[44px] rounded-xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <span>下一步：挑选艺术风格</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#eed8be]" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: Choosing Style */}
      {creationStep === 'choosingStyle' && (
        <div className="space-y-3.5">
          {/* Confirmed Candidate Photos Preview */}
          <div className="px-3.5">
            <div className="p-3 rounded-2xl bg-white border border-[#eae5dc] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1c1a18]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3b6e8c]" />
                  <span>已锁定候选记忆（{selectedPhotos.length} 张）</span>
                </span>
                <span className="text-[11px] text-[#7c756d]">
                  设定心情：{selectedMoodId === 'custom' ? (customMoodText || '自定义') : (MOOD_OPTIONS.find(m => m.id === selectedMoodId)?.title || selectedMoodId)}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e4ded4] bg-[#f5f2eb] relative shadow-2xs"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Prompt Capsule */}
          <div className="px-3.5">
            <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#eee6da] flex items-start gap-2.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#1c1a18] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-[#eed8be]" />
              </div>
              <div className="text-xs text-[#423d38] leading-relaxed">
                请为手账素材挑选艺术风格。主风格将决定线条与质感，辅助风格丰富视觉层次。
              </div>
            </div>
          </div>

          {/* Style Selector Component */}
          <div className="px-3.5">
            <StyleSelector
              primaryStyle={primaryStyleId}
              onSelectPrimaryStyle={(st) => setPrimaryStyleId(st)}
              secondaryStyles={secondaryStyleIds}
              onToggleSecondaryStyle={(st) =>
                setSecondaryStyleIds((prev) =>
                  prev.includes(st)
                    ? prev.filter((id) => id !== st)
                    : prev.length < 2
                    ? [...prev, st]
                    : prev
                )
              }
            />
          </div>

          {/* Sticky Bottom Bar for Style Step */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#fbfaf7] via-[#fbfaf7]/95 to-transparent z-20 flex gap-2.5 max-w-[430px] mx-auto">
            <button
              type="button"
              onClick={() => setCreationStep('choosingMood')}
              className="flex-1 min-h-[44px] rounded-xl bg-white border border-[#ded8cc] text-[#504a44] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#f6f4ee] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#7c756d]" />
              <span>重选心情</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToReady}
              className="flex-2 min-h-[44px] rounded-xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <span>下一步：确认制作方案</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#eed8be]" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: Ready to Generate (Direction Confirmation Page) */}
      {creationStep === 'readyToGenerate' && (
        <div className="space-y-3.5 px-3.5">
          {/* Agent Prompt Capsule */}
          <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#eee6da] flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-[#1c1a18] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#eed8be]" />
            </div>
            <div className="text-xs text-[#423d38] leading-relaxed">
              制作方案已就绪！点击下方按钮确认，即将把这 <strong className="text-[#1c1a18]">{selectedPhotos.length}</strong> 张真实照片转化为专属手账素材。
            </div>
          </div>

          {/* Direction Confirmation Breakdown */}
          <DirectionConfirmation
            photos={userPhotos}
            selectedPhotoIds={selectedPhotoIds}
            selectedMood={selectedMoodId}
            customMoodText={customMoodText}
            primaryStyle={primaryStyleId}
            secondaryStyles={secondaryStyleIds}
            onStartGeneration={handleBeginSubjectPlanning}
            onBackToEdit={() => setCreationStep('choosingStyle')}
          />
        </div>
      )}

      {/* SCREEN 6: Confirming Subjects (Subject Plan Confirmation Page) */}
      {creationStep === 'confirmingSubjects' && (
        <div className="space-y-3.5 px-3.5">
          {/* Agent Prompt Capsule */}
          <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#eee6da] flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-[#1c1a18] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#eed8be]" />
            </div>
            <div className="text-xs text-[#423d38] leading-relaxed">
              AI 已为你从 <strong className="text-[#1c1a18]">{selectedPhotos.length}</strong> 张照片中提炼出 <strong className="text-[#3b6e8c]">{subjectPlan.length}</strong> 个主要素材对象。请在下方核对或替换，确认无误后即可开始生成实体手账打印页。
            </div>
          </div>

          <SubjectPlanConfirmation
            subjects={subjectPlan}
            candidatePhotos={selectedPhotos}
            maxSubjects={5}
            onChange={(updated) => setSubjectPlan(updated)}
            onBack={() => setCreationStep('readyToGenerate')}
            onConfirm={handleConfirmSubjects}
          />
        </div>
      )}

      {/* SCREEN 7: Generating Sheet State */}
      {creationStep === 'generatingSheet' && (
        <PrintableSheetGenerating
          subjectCount={subjectPlan.filter((s) => s.enabled).length}
          onCancel={handleCancelSheetGeneration}
        />
      )}

      {/* SCREEN 8: Reviewing Sheet State */}
      {creationStep === 'reviewingSheet' && currentCreationSession?.printableSheet && (
        <PrintableSheetReview
          sheet={currentCreationSession.printableSheet}
          onBackToSubjects={() => setCreationStep('confirmingSubjects')}
        />
      )}

      {/* SCREEN 9: Sheet Generation Error State */}
      {creationStep === 'error' && (
        <div className="max-w-md mx-auto px-4 py-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#1a1917]">
              素材页生成遇到问题
            </h2>
            <p className="text-sm text-[#736c64] max-w-sm mx-auto">
              {currentCreationSession?.generationError?.message ||
                sheetError?.message ||
                '网络连接不稳定或服务暂时繁忙，未消耗成功生成配额。'}
            </p>
          </div>

          {/* Technical code/stage details if present */}
          {(currentCreationSession?.generationError?.code ||
            sheetError?.code ||
            currentCreationSession?.generationError?.stage ||
            sheetError?.stage) && (
            <div className="inline-flex flex-col items-center gap-1 px-4 py-2 bg-[#fcfbf9] border border-[#e8e4dc] rounded-xl text-xs text-[#8e877e]">
              {(currentCreationSession?.generationError?.code || sheetError?.code) && (
                <span>
                  错误代码:{' '}
                  <code className="font-mono text-[#544f49]">
                    {currentCreationSession?.generationError?.code || sheetError?.code}
                  </code>
                </span>
              )}
              {(currentCreationSession?.generationError?.stage || sheetError?.stage) && (
                <span>
                  处理阶段:{' '}
                  <code className="font-mono text-[#544f49]">
                    {currentCreationSession?.generationError?.stage || sheetError?.stage}
                  </code>
                </span>
              )}
            </div>
          )}

          {/* Action buttons: back to subjects vs retry */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreationStep('confirmingSubjects')}
              className="px-5 py-2.5 rounded-xl border border-[#d6cfc5] bg-white text-[#544f49] hover:bg-[#faf8f5] font-medium text-xs transition-all shadow-sm active:scale-95"
            >
              返回调整对象
            </button>
            <button
              type="button"
              disabled={isGeneratingSheet}
              onClick={() => handleConfirmSubjects()}
              className="px-6 py-2.5 rounded-xl bg-[#1c1a18] hover:bg-black text-white font-medium text-xs transition-all shadow-md active:scale-95 disabled:opacity-40"
            >
              再次尝试
            </button>
          </div>
        </div>
      )}

      {/* Existing AI Studio Chatbot Bottom Sheet */}
      <GeminiAgentBottomSheet
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        statusMessage={statusMessage}
        candidateCount={selectedPhotoIds.length}
        totalPhotosCount={userPhotos.length}
        isRunningTour={isRunningTour}
        isPaused={isPaused}
        messages={messages}
        onDispatchAction={handleDispatchAction}
        onSendMessage={handleSendChatMessage}
        isProcessingChat={isProcessingChat}
      />

      {/* Plan Confirmed Modal (Phase 1 Completion) */}
      <AnimatePresence>
        {showPlanConfirmedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xs p-5 rounded-3xl bg-white border border-[#eae4d8] shadow-xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#ddf3e9] text-[#2b7354] flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1c1a18]">
                  制作方案已成功锁定
                </h3>
                <p className="text-xs text-[#7c756d] leading-relaxed">
                  已成功保留 {selectedPhotoIds.length} 张照片的高清与缩略图副本，心情与艺术风格偏好已安全归档至本地数据库。
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#faf8f4] border border-[#eee8dc] text-left text-[11px] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#8e877e]">候选照片：</span>
                  <span className="font-semibold text-[#1c1a18]">{selectedPhotoIds.length} 张</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8e877e]">设定心情：</span>
                  <span className="font-semibold text-[#1c1a18]">
                    {selectedMoodId === 'custom'
                      ? customMoodText || '自定义心情'
                      : MOOD_OPTIONS.find((m) => m.id === selectedMoodId)?.title || selectedMoodId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8e877e]">艺术主风格：</span>
                  <span className="font-semibold text-[#3b6e8c]">
                    {STYLE_OPTIONS.find((s) => s.id === primaryStyleId)?.name || primaryStyleId}
                  </span>
                </div>
                {secondaryStyleIds.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e877e]">辅助风格：</span>
                    <span className="font-medium text-[#7c7062]">
                      {secondaryStyleIds
                        .map((id) => STYLE_OPTIONS.find((s) => s.id === id)?.name || id)
                        .join('、')}
                    </span>
                  </div>
                )}
                {subjectPlan.filter((s) => s.enabled).length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e877e]">主要素材对象：</span>
                    <span className="font-semibold text-[#2b7354]">
                      {subjectPlan.filter((s) => s.enabled).length} 个核心元素
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanConfirmedModal(false);
                    onBack();
                  }}
                  className="w-full min-h-[42px] rounded-xl bg-[#1c1a18] text-white text-xs font-semibold active:scale-95 transition-transform cursor-pointer"
                >
                  完成并返回创作页
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlanConfirmedModal(false)}
                  className="w-full min-h-[38px] rounded-xl border border-[#ded8cc] bg-white text-[#7c756d] hover:text-[#1c1a18] text-xs font-medium active:scale-95 transition-transform cursor-pointer"
                >
                  留在当前方案页
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
