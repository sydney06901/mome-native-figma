export type TaskStatusType =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'interrupted';

export type TaskType = 'parse_query' | 'search_photos' | 'generate_illustration';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatusType;
  stageName: string; // e.g. "解析检索条件" / "正在比对相册特征" / "整理线稿细节"
  createdAt: number;
  updatedAt: number;
  resultAssetId?: string;
  matchedPhotoIds?: string[];
  error?: string;
}
