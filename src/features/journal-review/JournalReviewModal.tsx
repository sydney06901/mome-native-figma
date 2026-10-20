import React, { useState, useRef } from 'react';
import { Camera, ArrowLeft, Sparkles, Check, Upload, X } from 'lucide-react';

interface JournalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JournalReviewModal: React.FC<JournalReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setFeedback(null);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedImage) return;
    setAnalyzing(true);
    // Real-feeling layout review analysis
    setTimeout(() => {
      setAnalyzing(false);
      setFeedback(
        '【版面结构与留白建议】\n1. 左上角标题区域留白充足，文字视觉重心平稳。\n2. 中部右侧票根与胶带堆叠稍显紧凑，可向外展开 5-8mm 增加呼吸感。\n3. 底部可适当加入一枚植物/建筑线稿小贴纸，呼应主题氛围。'
      );
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fbf9f5] rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl border border-[#e4ded4]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eeeae2] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#507d64]/10 text-[#507d64] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#2c2825]">实体手账 AI 审阅</h3>
              <p className="text-[10px] text-[#7c756d]">拍下手账本页，生成版面平衡与贴纸建议</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-[#f2ede4] text-[#7c756d] flex items-center justify-center hover:text-[#1c1a18] active:scale-95"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Frame */}
        <div className="space-y-3">
          {uploadedImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#e4ded4] bg-white">
              <img
                src={uploadedImage}
                alt="实体手账照片"
                className="w-full max-h-56 object-contain bg-[#1c1a18]"
              />
              <button
                type="button"
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px]"
              >
                更换照片
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#dcd6ca] rounded-2xl p-8 text-center bg-white/60 hover:bg-white cursor-pointer active:scale-98 transition-all space-y-2"
            >
              <Upload className="w-8 h-8 mx-auto text-[#7c756d]" />
              <p className="text-xs font-medium text-[#2c2825]">上传或拍摄你的实体手账本</p>
              <p className="text-[11px] text-[#7c756d]">支持普通光照下的手账平拍照片</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {uploadedImage && !feedback && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full min-h-[46px] rounded-xl bg-[#2c2825] text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#eed8be]" />
            <span>{analyzing ? 'AI 正在解析构图与留白...' : '开始版面分析'}</span>
          </button>
        )}

        {feedback && (
          <div className="p-4 rounded-xl bg-white border border-[#e8e4dc] space-y-2 animate-in fade-in">
            <span className="text-[11px] font-semibold text-[#507d64]">AI 构图与留白建议</span>
            <p className="text-xs text-[#4a453e] whitespace-pre-line leading-relaxed">
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
