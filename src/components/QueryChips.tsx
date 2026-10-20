import React, { useState } from 'react';
import { Calendar, Tag, Palette, ChevronDown, Check } from 'lucide-react';

interface QueryChipsProps {
  date: string; // e.g. "2026-10-10"
  dateLabel?: string; // e.g. "2026年10月10日 (周六)"
  keyword: string; // e.g. "建筑"
  style: string; // e.g. "黑白线稿"
  onDateChange: (newDate: string, newLabel: string) => void;
  onKeywordChange: (newKeyword: string) => void;
  onStyleChange: (newStyle: string) => void;
  disabled?: boolean;
}

export const QueryChips: React.FC<QueryChipsProps> = ({
  date,
  dateLabel,
  keyword,
  style,
  onDateChange,
  onKeywordChange,
  onStyleChange,
  disabled = false,
}) => {
  const [activeDialog, setActiveDialog] = useState<'date' | 'keyword' | 'style' | null>(null);

  const keywords = ['建筑', '植物', '食物', '街景', '手写字'];
  const styles = ['黑白线稿'];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <span className="text-[#747078] shrink-0 text-[11px] font-medium tracking-tight">条件确认:</span>

      {/* Date Condition */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setActiveDialog('date')}
        className="shrink-0 flex items-center gap-1.5 px-3.5 min-h-[34px] rounded-full bg-white border border-[#2a2336]/[0.08] text-[#17171B] hover:border-[#9684DF] active:scale-95 transition-all text-xs shadow-xs"
      >
        <Calendar className="w-3.5 h-3.5 text-[#9684DF]" />
        <span>{dateLabel || date}</span>
        <ChevronDown className="w-3 h-3 text-[#A19CA6]" />
      </button>

      {/* Keyword Condition */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setActiveDialog('keyword')}
        className="shrink-0 flex items-center gap-1.5 px-3.5 min-h-[34px] rounded-full bg-white border border-[#2a2336]/[0.08] text-[#17171B] hover:border-[#72C9A3] active:scale-95 transition-all text-xs shadow-xs"
      >
        <Tag className="w-3.5 h-3.5 text-[#72C9A3]" />
        <span>目标：{keyword}</span>
        <ChevronDown className="w-3 h-3 text-[#A19CA6]" />
      </button>

      {/* Style Condition */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setActiveDialog('style')}
        className="shrink-0 flex items-center gap-1.5 px-3.5 min-h-[34px] rounded-full bg-white border border-[#2a2336]/[0.08] text-[#17171B] hover:border-[#E8925A] active:scale-95 transition-all text-xs shadow-xs"
      >
        <Palette className="w-3.5 h-3.5 text-[#E8925A]" />
        <span>风格：{style}</span>
        <ChevronDown className="w-3 h-3 text-[#A19CA6]" />
      </button>

      {/* Date Dialog */}
      {activeDialog === 'date' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-sm p-5 space-y-3 shadow-xl border border-[#2a2336]/[0.08]">
            <h3 className="font-display text-[18px] font-bold text-[#17171B]">选择或确认拍摄日期</h3>
            <p className="text-xs text-[#747078]">
              已将任务中的“周六”推导为 2026年10月10日，您可以手动修改为其他日期或设置为未知。
            </p>
            <div className="space-y-1.5 pt-1">
              {[
                { val: '2026-10-10', label: '2026年10月10日 (周六)' },
                { val: '2026-10-11', label: '2026年10月11日 (周日)' },
                { val: '日期未知', label: '日期未知 (全部照片均参与匹配)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onDateChange(opt.val, opt.label);
                    setActiveDialog(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs text-left ${
                    date === opt.val
                      ? 'border-[#9684DF] bg-[#E7E1FA] font-medium text-[#55429E]'
                      : 'border-[#2a2336]/[0.06] hover:bg-[#F2F0F6] text-[#17171B]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {date === opt.val && <Check className="w-4 h-4 text-[#55429E]" />}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="w-full min-h-[44px] text-xs font-medium text-[#17171B] bg-[#F2F0F6] rounded-full hover:bg-[#E7E1FA]"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Dialog */}
      {activeDialog === 'keyword' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-sm p-5 space-y-3 shadow-xl border border-[#2a2336]/[0.08]">
            <h3 className="font-display text-[18px] font-bold text-[#17171B]">选择目标物件类别</h3>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {keywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    onKeywordChange(kw);
                    setActiveDialog(null);
                  }}
                  className={`p-3 rounded-2xl border text-xs text-left flex items-center justify-between ${
                    keyword === kw
                      ? 'border-[#72C9A3] bg-[#DDF3E9] font-medium text-[#2B7354]'
                      : 'border-[#2a2336]/[0.06] hover:bg-[#F2F0F6] text-[#17171B]'
                  }`}
                >
                  <span>{kw}</span>
                  {keyword === kw && <Check className="w-4 h-4 text-[#2B7354]" />}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveDialog(null)}
              className="w-full mt-2 min-h-[44px] text-xs font-medium text-[#747078] bg-[#F2F0F6] rounded-full"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Style Dialog */}
      {activeDialog === 'style' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-sm p-5 space-y-3 shadow-xl border border-[#2a2336]/[0.08]">
            <h3 className="font-display text-[18px] font-bold text-[#17171B]">选择插画生成风格</h3>
            <p className="text-xs text-[#747078]">首发版本专注于最适合手账拼贴的“黑白建筑线稿”。</p>
            <div className="space-y-2 pt-1">
              {styles.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onStyleChange(st);
                    setActiveDialog(null);
                  }}
                  className="w-full p-3 rounded-2xl border border-[#E8925A] bg-[#F8E2D4] font-medium text-[#93491E] text-xs flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="font-semibold">{st}</p>
                    <p className="text-[11px] text-[#747078] mt-0.5">墨线结构、建筑排线、适于拼贴叠色</p>
                  </div>
                  <Check className="w-4 h-4 text-[#93491E]" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveDialog(null)}
              className="w-full mt-2 min-h-[44px] text-xs font-medium text-[#747078] bg-[#F2F0F6] rounded-full"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
