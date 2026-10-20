import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, CheckCircle2, Sparkles, Tag, Heart } from 'lucide-react';
import { PrintableMaterialSheet } from '../../../domain/types';

export interface PrintableSheetReviewProps {
  sheet: PrintableMaterialSheet;
  onBackToSubjects: () => void;
}

export const PrintableSheetReview: React.FC<PrintableSheetReviewProps> = ({
  sheet,
  onBackToSubjects,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (!sheet.imageBlob) return;
    const url = URL.createObjectURL(sheet.imageBlob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sheet.imageBlob]);

  const handleDownload = () => {
    if (!sheet.imageBlob) return;
    const downloadUrl = URL.createObjectURL(sheet.imageBlob);
    const dateStr = new Date(sheet.createdAt || Date.now()).toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `mome-printable-material-sheet-${dateStr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / Congratulations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-emerald-50/60 border border-amber-200/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1a1917]">
              彩色打印素材页已生成
            </h2>
            <p className="text-xs text-[#736c64]">
              已将你确认的 {sheet.subjects.length} 个主要元素排布为单张可剪裁手账贴纸页
            </p>
          </div>
        </div>

        {/* Download Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSubjects}
            className="px-4 py-2 rounded-xl border border-[#d6cfc5] bg-white text-[#544f49] hover:bg-[#faf8f5] font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回调整对象</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-[#d96b43] hover:bg-[#c25932] text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>下载彩色 PNG</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Image Preview */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-[#e8e4dc] flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Printable Journal Material Sheet"
                className="max-h-[640px] w-auto object-contain rounded-lg shadow-sm border border-[#f0ede6]"
              />
            ) : (
              <div className="h-96 w-full flex items-center justify-center text-[#8e877e] text-sm">
                正在载入预览...
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-[#8e877e] text-center">
            纯白背景已就绪，可直接用彩色打印机输出在 A4 贴纸相纸或硫酸纸上。
          </p>
        </div>

        {/* Right 1 Col: Sheet Metadata Breakdown */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e8e4dc] shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-[#1a1917] flex items-center gap-1.5 pb-3 border-b border-[#f0ede6]">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>素材页规格与风格</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8e877e] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> 主要对象数：
                </span>
                <span className="font-semibold text-[#1a1917] bg-[#f5f2eb] px-2 py-0.5 rounded-full">
                  {sheet.subjects.length} 个
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8e877e] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> 氛围情绪：
                </span>
                <span className="font-medium text-[#1a1917]">
                  {sheet.mood || '温暖怀旧'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8e877e]">主要风格：</span>
                <span className="font-medium text-[#1a1917]">
                  {sheet.primaryStyle}
                </span>
              </div>

              {sheet.secondaryStyles && sheet.secondaryStyles.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-[#8e877e] shrink-0">辅助点缀：</span>
                  <span className="font-medium text-[#544f49] text-right">
                    {sheet.secondaryStyles.join('、')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-[#f0ede6]">
                <span className="text-[#8e877e]">输出文件：</span>
                <span className="font-mono text-[#544f49]">
                  {sheet.mimeType === 'image/jpeg' ? 'JPEG' : 'PNG'} 高清图
                </span>
              </div>
            </div>
          </div>

          {/* Included Subjects List */}
          <div className="bg-[#fcfbf9] rounded-2xl p-5 border border-[#eeebe4] space-y-3">
            <h4 className="text-xs font-semibold text-[#544f49]">
              包含的核心素材对象（{sheet.subjects.length}）
            </h4>
            <div className="space-y-2">
              {sheet.subjects.map((subj, idx) => (
                <div
                  key={subj.id || idx}
                  className="bg-white p-2.5 rounded-xl border border-[#e8e4dc] text-xs space-y-1"
                >
                  <div className="font-medium text-[#1a1917] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{subj.title}</span>
                  </div>
                  {subj.description && (
                    <p className="text-[#736c64] line-clamp-2 pl-5 text-[11px]">
                      {subj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
