import React from 'react';
import { Loader2, AlertCircle, Sparkles, Layers } from 'lucide-react';

export interface PrintableSheetGeneratingProps {
  subjectCount: number;
  onCancel: () => void;
}

export const PrintableSheetGenerating: React.FC<PrintableSheetGeneratingProps> = ({
  subjectCount,
  onCancel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto px-6 py-12 text-center">
      {/* Decorative spinning ring icon */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-amber-100 border-t-amber-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>
      </div>

      {/* Main Title */}
      <h2 className="text-2xl font-bold text-[#1a1917] tracking-tight mb-3">
        正在生成 1 张彩色打印素材页
      </h2>

      {/* Core Status Statements */}
      <div className="space-y-2 mb-8 text-[#544f49]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-sm font-medium">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>正在使用你确认的 {subjectCount} 个主要对象</span>
        </div>
        <p className="text-sm text-[#736c64]">
          本次只会进行 1 次图片生成请求，由 Gemini Nano Banana 2.1 高清合成。
        </p>
        <p className="text-xs text-[#8e877e]">
          合成整页 A4 高清贴纸需要约 15–30 秒，请保持当前页面开启。
        </p>
      </div>

      {/* Cancel Action & Caution Note */}
      <div className="w-full max-w-sm pt-4 border-t border-[#e8e4dc]/80 flex flex-col items-center">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-[#d6cfc5] bg-white text-[#544f49] hover:bg-[#faf8f5] hover:border-[#b8afa3] font-medium text-sm transition-all shadow-sm active:scale-95"
        >
          取消等待
        </button>

        <div className="mt-4 flex items-start gap-2 text-left bg-[#fcfbf9] border border-[#eeebe4] rounded-lg p-3 text-xs text-[#8e877e]">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            提示：如果请求已经到达图片模型，取消等待不一定能撤销已经产生的模型费用。
          </p>
        </div>
      </div>
    </div>
  );
};
