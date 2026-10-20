import { CursorEvent, CursorVisualState } from './types.ts';

/**
 * Pure mapping function from domain cursor events to Bloub visual states.
 * Memory Explorer publishes business events; this maps them to emotional / visual states.
 */
export function mapCursorEventToVisualState(event: CursorEvent): CursorVisualState {
  switch (event) {
    case 'taskStarted':
      return 'preparing';
    case 'batchStarted':
      return 'travelling';
    case 'photoFocused':
      return 'observing';
    case 'photoSkipped':
      return 'observing';
    case 'matchFound':
      return 'matched';
    case 'candidateAdded':
      return 'confirming';
    case 'batchCompleted':
      return 'celebrating';
    case 'paused':
      return 'paused';
    case 'resumed':
      return 'observing';
    case 'completed':
      return 'celebrating';
    case 'error':
      return 'confused';
    default:
      return 'idle';
  }
}

/**
 * Human-readable accessible text status for each visual state.
 * Ensures accessibility compliance: all animation states have accompanying text.
 */
export function getVisualStateDescription(state: CursorVisualState): string {
  switch (state) {
    case 'idle':
      return 'Bloub 处于待命状态';
    case 'preparing':
      return 'Bloub 正在准备分析环境';
    case 'travelling':
      return 'Bloub 正在相册网格中巡视';
    case 'observing':
      return 'Bloub 正在细致观察照片主体';
    case 'thinking':
      return 'Bloub 正在比对特征';
    case 'matched':
      return 'Bloub 发现吻合特征的照片！';
    case 'confirming':
      return 'Bloub 正在将照片放入候选清单';
    case 'paused':
      return 'Bloub 巡视任务已暂停';
    case 'celebrating':
      return 'Bloub 已完成全部照片检索！';
    case 'confused':
      return 'Bloub 遇到网络或分析异常';
    default:
      return 'Bloub 待命中';
  }
}
