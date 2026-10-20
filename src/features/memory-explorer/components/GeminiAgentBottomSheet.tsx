import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryAgentAction } from '../../../domain/types.ts';
import { ChatMessage } from '../../../services/geminiChatAgent.ts';
import { BloubAvatarView } from '../bloub/BloubAvatarView.tsx';
import {
  X,
  Send,
  Sparkles,
  Play,
  Pause,
  FastForward,
  Square,
  Compass,
} from 'lucide-react';

export const SUGGESTED_PROMPT_CHIPS = [
  '帮我寻找适合转化成贴图的建筑',
  '找出有故事感的人物瞬间',
  '寻找适合做手账背景的风景',
  '找出具有特别颜色和纹理的照片',
  '寻找值得保留的旅行细节',
];

interface GeminiAgentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  statusMessage: string;
  candidateCount: number;
  totalPhotosCount: number;
  isRunningTour: boolean;
  isPaused: boolean;
  messages: ChatMessage[];
  onDispatchAction: (action: MemoryAgentAction) => void;
  onSendMessage: (userText: string) => Promise<void>;
  isProcessingChat?: boolean;
}

export const GeminiAgentBottomSheet: React.FC<GeminiAgentBottomSheetProps> = ({
  isOpen,
  onClose,
  statusMessage,
  candidateCount,
  totalPhotosCount,
  isRunningTour,
  isPaused,
  messages,
  onDispatchAction,
  onSendMessage,
  isProcessingChat = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSelectChip = (chip: string) => {
    setInputText(chip);
    inputRef.current?.focus();
  };

  const handleStartSearch = () => {
    const query = inputText.trim() || '帮我寻找适合转化成贴图的建筑';
    onDispatchAction({
      type: 'START_PHOTO_SEARCH',
      query,
    });
    setInputText('');
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isProcessingChat) return;

    // Send natural conversation turn to Gemini Agent
    await onSendMessage(text);
    setInputText('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto bg-[#fbf9f5] rounded-t-[28px] border-t border-[#e8e2d6] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] max-h-[86vh] flex flex-col overflow-hidden"
          >
            {/* Grab handle */}
            <div className="w-10 h-1 bg-[#d8d2c6] rounded-full mx-auto my-2.5 shrink-0" />

            {/* Sheet Header */}
            <div className="px-4 pb-3 border-b border-[#eee8dd] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c1a18] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <div className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-75" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-[#1c1a18] tracking-tight">
                      Gemini 记忆探索 Agent
                    </h2>
                    {candidateCount > 0 && (
                      <span className="text-[10px] font-semibold text-[#3b6e8c] bg-[#3b6e8c]/10 px-1.5 py-0.2 rounded-full">
                        候选 {candidateCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7c756d] font-normal truncate max-w-[220px]">
                    {statusMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#f0eae0] hover:bg-[#e6dfd4] text-[#635c54] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="关闭对话"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Chat History */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[160px] text-xs">
              {messages.map((msg) => {
                const isModel = msg.role === 'model';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      isModel ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isModel && (
                      <div className="w-6 h-6 rounded-full bg-[#1c1a18] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        ✨
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed select-text ${
                        isModel
                          ? 'bg-white text-[#2c2825] border border-[#e8e2d6] shadow-2xs rounded-tl-sm'
                          : 'bg-[#1c1a18] text-white shadow-xs rounded-tr-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {isProcessingChat && (
                <div className="flex items-center gap-2 text-[11px] text-[#7c756d]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b6e8c] animate-ping" />
                  <span>Gemini 正在思考...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="px-4 py-2 border-t border-[#eee8dd] bg-[#fdfcf9]/80 shrink-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-[#3b6e8c]" />
                <span className="text-[10px] font-medium text-[#7c756d]">
                  快捷要求芯片（点击填入）：
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {SUGGESTED_PROMPT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectChip(chip)}
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#e2dcd2] text-[#4a443e] hover:border-[#3b6e8c] hover:text-[#3b6e8c] active:scale-95 transition-all shadow-2xs whitespace-nowrap"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Action Bar */}
            <div className="p-3 bg-white border-t border-[#eee8dd] shrink-0 space-y-2">
              <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="例如：帮我寻找适合变成复古建筑贴纸的照片"
                  className="flex-1 min-h-[40px] px-3.5 rounded-xl bg-[#f4f0e8] border border-transparent focus:border-[#3b6e8c] focus:bg-white text-xs text-[#1c1a18] placeholder:text-[#9c9489] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleStartSearch}
                  className="min-h-[40px] px-3.5 rounded-xl bg-[#1c1a18] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shrink-0 shadow-xs cursor-pointer"
                  title="开始巡视照片"
                >
                  <Compass className="w-3.5 h-3.5 text-[#eed8be]" />
                  <span>开始巡视</span>
                </button>
              </form>

              {/* Task workflow controls if search is running */}
              {isRunningTour && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#7c756d]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onDispatchAction(
                          isPaused
                            ? { type: 'RESUME_PHOTO_SEARCH' }
                            : { type: 'PAUSE_PHOTO_SEARCH' }
                        )
                      }
                      className="px-2 py-1 rounded-lg bg-[#f0eae0] hover:bg-[#e4ddd2] text-[#4a443e] flex items-center gap-1 font-medium"
                    >
                      {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      <span>{isPaused ? '恢复巡视' : '暂停巡视'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDispatchAction({ type: 'SKIP_VISUAL_REVIEW' })}
                      className="px-2 py-1 rounded-lg bg-[#f0eae0] hover:bg-[#e4ddd2] text-[#4a443e] flex items-center gap-1 font-medium"
                    >
                      <FastForward className="w-3 h-3" />
                      <span>跳过动画</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDispatchAction({ type: 'STOP_PHOTO_SEARCH' })}
                    className="px-2 py-1 rounded-lg bg-[#fdedeb] text-[#b34033] flex items-center gap-1 font-medium"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>停止</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
