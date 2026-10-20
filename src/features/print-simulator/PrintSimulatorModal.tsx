import React, { useState } from 'react';
import { Printer, X, Check, RefreshCw } from 'lucide-react';

interface PrintSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleImageUrl?: string;
}

export const PrintSimulatorModal: React.FC<PrintSimulatorModalProps> = ({
  isOpen,
  onClose,
  sampleImageUrl,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success'>('idle');

  if (!isOpen) return null;

  const handleStartPrint = () => {
    setPrintStatus('printing');
    setTimeout(() => {
      setPrintStatus('success');
      setTimeout(() => setPrintStatus('idle'), 2500);
    }, 1800);
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
            <div className="w-8 h-8 rounded-lg bg-[#3b6e8c]/10 text-[#3b6e8c] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#2c2825]">便携热敏打印模拟</h3>
              <p className="text-[10px] text-[#7c756d]">黑白点阵纸条输出效果预览</p>
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

        {/* Paper Specification Toggle */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-[#ded8cc] text-xs">
          <span className="text-[#7c756d] font-medium tracking-tight">打印机卷纸规格</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPaperWidth('58mm')}
              className={`px-3.5 min-h-[44px] rounded-xl font-medium transition-colors flex items-center active:scale-95 ${
                paperWidth === '58mm'
                  ? 'bg-[#1c1a18] text-white shadow-xs'
                  : 'bg-[#f4efe6] text-[#7c756d]'
              }`}
            >
              58mm 口袋机
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth('80mm')}
              className={`px-3.5 min-h-[44px] rounded-xl font-medium transition-colors flex items-center active:scale-95 ${
                paperWidth === '80mm'
                  ? 'bg-[#1c1a18] text-white shadow-xs'
                  : 'bg-[#f4efe6] text-[#7c756d]'
              }`}
            >
              80mm 宽幅
            </button>
          </div>
        </div>

        {/* Thermal Receipt Paper Strip Simulation */}
        <div className="bg-[#ede8df] p-4 rounded-2xl flex justify-center">
          <div
            className={`bg-[#fdfcf7] shadow-lg border-x border-dashed border-[#d5cebf] py-5 px-3 flex flex-col items-center text-center font-mono ${
              paperWidth === '58mm' ? 'w-52' : 'w-64'
            } transition-all`}
            style={{
              backgroundImage:
                'radial-gradient(#d5cebf 0.75px, transparent 0.75px)',
              backgroundSize: '4px 4px',
            }}
          >
            <p className="text-[10px] font-bold text-[#1f1c1a] tracking-widest uppercase">
              *** MOME JOURNAL ***
            </p>
            <p className="text-[9px] text-[#6e685f] mt-0.5">
              {new Date().toLocaleDateString('zh-CN')} · MEMORY RECEIPT
            </p>
            <div className="w-full border-b border-dashed border-[#aaa] my-2" />

            {sampleImageUrl ? (
              <img
                src={sampleImageUrl}
                alt="热敏点阵效果"
                className="w-full h-32 object-contain grayscale contrast-200 filter"
              />
            ) : (
              <div className="w-full h-28 border border-[#bbb] flex flex-col items-center justify-center text-[10px] text-[#777] p-2">
                <span>[ 视觉素材黑白点阵预览 ]</span>
                <span className="text-[8px] text-[#999] mt-1">203 DPI 高密度热敏转印</span>
              </div>
            )}

            <div className="w-full border-b border-dashed border-[#aaa] my-2" />
            <p className="text-[9px] text-[#555]">
              已生成可撕手撕边 · 适合作为手账边框素材
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleStartPrint}
            disabled={printStatus === 'printing'}
            className="w-full min-h-[46px] rounded-xl bg-[#2c2825] text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-sm disabled:opacity-50"
          >
            {printStatus === 'printing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#eed8be]" />
                <span>正在模拟发送数据至热敏头...</span>
              </>
            ) : printStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-[#78c293]" />
                <span>热敏纸条已出纸完成</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-[#eed8be]" />
                <span>模拟发送打印任务</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
