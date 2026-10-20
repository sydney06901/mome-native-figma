import React from 'react';
import { Task, TaskStatusType } from '../models/Task.ts';
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface TaskStatusProps {
  task: Task | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const TaskStatus: React.FC<TaskStatusProps> = ({ task, onCancel, onRetry }) => {
  if (!task) return null;

  const getStatusBadge = (status: TaskStatusType) => {
    switch (status) {
      case 'queued':
        return { label: '排队中', color: 'text-[#7c756d]', icon: Loader2, spin: true };
      case 'running':
        return { label: '进行中', color: 'text-[#3b6e8c]', icon: Loader2, spin: true };
      case 'succeeded':
        return { label: '已完成', color: 'text-[#487353]', icon: CheckCircle2, spin: false };
      case 'failed':
        return { label: '失败', color: 'text-[#b34033]', icon: AlertCircle, spin: false };
      case 'cancelled':
        return { label: '已取消', color: 'text-[#7c756d]', icon: XCircle, spin: false };
      case 'interrupted':
        return { label: '已中断', color: 'text-[#b34033]', icon: AlertCircle, spin: false };
    }
  };

  const badge = getStatusBadge(task.status);
  const Icon = badge.icon;

  return (
    <div className="p-3 bg-white rounded-xl border border-[#e8e4dc] flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${badge.color} ${badge.spin ? 'animate-spin' : ''}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${badge.color}`}>{badge.label}</span>
            <span className="text-[#9e978e]">·</span>
            <span className="text-[#2c2825] truncate font-medium">{task.stageName}</span>
          </div>
          {task.error && <p className="text-[11px] text-[#b34033] truncate mt-0.5">{task.error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {task.status === 'running' && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 text-xs text-[#7c756d] hover:text-[#2c2825] border border-[#ded8cc] rounded-lg"
          >
            取消
          </button>
        )}
        {(task.status === 'failed' || task.status === 'cancelled') && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 text-xs text-white bg-[#3b6e8c] rounded-lg"
          >
            重试
          </button>
        )}
      </div>
    </div>
  );
};
