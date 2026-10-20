import { PhotoItem } from '../models/PhotoItem.ts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface AgentAction {
  action: 'inspectPhoto' | 'highlightPhoto' | 'selectPhoto' | 'skipPhoto' | 'completeTask';
  photoId?: string;
  reason: string;
}

export interface ChatAgentResponse {
  reply: string;
  suggestedActions: AgentAction[];
  matchedPhotoIds: string[];
  isMock?: boolean;
}

export async function sendChatToAgent(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  photos: PhotoItem[],
  currentSelectedPhotoIds: string[]
): Promise<ChatAgentResponse> {
  const res = await fetch('/api/gemini/chat-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      photos,
      currentSelectedPhotoIds,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gemini Agent 服务响应异常 (HTTP ${res.status})`);
  }

  return res.json();
}
