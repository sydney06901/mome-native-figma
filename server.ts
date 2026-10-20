import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  NEUTRAL_EXPLORATION_PROMPT,
  parseExplorationPrompt,
} from './src/features/mome/services/explorationPromptClient.ts';
import {
  composeMaterialSheetPrompt,
  createIdempotentRunner,
  IMAGE_OUTPUT_CONFIG,
  validateMaterialSheetRequest,
} from './src/server/mome/materialSheet.ts';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

// Body parser with 30mb limit for base64 thumbnails
app.use(express.json({ limit: '30mb' }));

const apiKey = process.env.GEMINI_API_KEY;

// Server-side Gemini client
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health / Status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// Photo Batch Analysis Route
app.post('/api/gemini/analyze-batch', async (req, res) => {
  try {
    const { taskId, userQuery, photos, batchIndex, totalBatches } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty photos array' });
    }

    // If no API key configured on server, return structured authentication error
    if (!ai || !apiKey) {
      return res.status(503).json({
        code: 'GEMINI_NOT_CONFIGURED',
        stage: 'authentication',
        message: '服务端没有获取到 Gemini API 配置',
      });
    }

    const promptText = `
You are analyzing a batch of photos for a mobile memory scrapbook app called "mome".
User search query: "${userQuery || '寻找可用于手账拼贴的建筑或特色物件'}"

For each photo provided in this batch, evaluate if the photo matches what the user is looking for.
You MUST return a JSON object with a "results" array. Every photo in the batch must have an entry matching its photoId.

Each entry must have:
- photoId: string (exact ID from input)
- summary: string (short Chinese summary of the photo content, 10-20 chars)
- labels: array of strings (3-5 Chinese tags, e.g. ["建筑", "教堂", "街景"])
- detectedSubjects: array of strings (key subjects detected, e.g. ["老教堂立面", "石拱门"])
- match: boolean (true if it matches the userQuery)
- confidence: number (0.0 to 1.0)
- reason: string (short, user-facing Chinese explanation in 1 sentence, why it matched or did not match)
- analyzedAt: ISO timestamp

Batch metadata:
${JSON.stringify(
  photos.map((p: any) => ({
    photoId: p.photoId,
    metadata: p.metadata,
  }))
)}
`;

    // Prepare contents with thumbnail image inlineData
    const parts: any[] = [{ text: promptText }];

    for (const photo of photos) {
      if (photo.imageData && typeof photo.imageData === 'string') {
        let mimeType = photo.mimeType || 'image/jpeg';
        let rawBase64 = photo.imageData;

        // Strip data: prefix if present
        const match = photo.imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          rawBase64 = match[2];
        }

        parts.push({
          inlineData: {
            mimeType,
            data: rawBase64,
          },
        });
        parts.push({
          text: `[Image for photoId: ${photo.photoId}]`,
        });
      }
    }

    // Call Gemini with model fallback (gemini-3.1-flash-lite / gemini-3.8-flash)
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let response: any = null;
    let modelUsed = '';
    let lastGeminiErr: any = null;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: parts,
          config: {
            responseMimeType: 'application/json',
          },
        });
        modelUsed = model;
        break;
      } catch (mErr: any) {
        lastGeminiErr = mErr;
        console.warn(`Model ${model} failed:`, mErr?.status || mErr?.message);
        // If 429 quota, 404, or RESOURCE_EXHAUSTED, try next model in list
        const isQuotaOrNotFound =
          mErr?.status === 429 ||
          mErr?.status === 404 ||
          (typeof mErr?.message === 'string' &&
            (mErr.message.includes('"code":429') || mErr.message.includes('RESOURCE_EXHAUSTED')));
        if (isQuotaOrNotFound) {
          continue;
        }
        throw mErr;
      }
    }

    if (!response && lastGeminiErr) {
      throw lastGeminiErr;
    }

    const responseText = response?.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch {
          return res.status(502).json({
            code: 'INVALID_GEMINI_RESPONSE',
            stage: 'response_parsing',
            status: 502,
            message: 'Gemini 返回的 JSON 格式不合法',
          });
        }
      } else {
        return res.status(502).json({
          code: 'INVALID_GEMINI_RESPONSE',
          stage: 'response_parsing',
          status: 502,
          message: 'Gemini 未返回有效的 JSON 结构',
        });
      }
    }

    const results = Array.isArray(parsed.results) ? parsed.results : [];
    return res.json({
      taskId,
      batchIndex,
      totalBatches,
      results,
      isMock: false,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Gemini analyze-batch error:', err);
    let status = err?.status || err?.statusCode || 500;
    let code = err?.code || 'GEMINI_REQUEST_FAILED';
    let msg = err?.message || String(err);

    try {
      if (typeof msg === 'string' && msg.startsWith('{')) {
        const parsedErr = JSON.parse(msg);
        if (parsedErr.error) {
          if (parsedErr.error.code) status = parsedErr.error.code;
          if (parsedErr.error.status) code = parsedErr.error.status;
          if (parsedErr.error.message) msg = parsedErr.error.message;
        }
      }
    } catch {
      // ignore
    }

    if (status === 429 || (typeof msg === 'string' && msg.includes('RESOURCE_EXHAUSTED'))) {
      code = 'RESOURCE_EXHAUSTED';
      status = 429;
    }

    return res.status(status).json({
      code,
      stage: 'gemini_request',
      status,
      message: msg,
    });
  }
});

// Interactive Gemini Scrapbook Chat Agent Route
app.post('/api/gemini/chat-agent', async (req, res) => {
  try {
    const { mode, messages, photos, currentSelectedPhotoIds } = req.body;

    if (mode === 'onboarding') {
      if (!ai || !apiKey) return res.json(NEUTRAL_EXPLORATION_PROMPT);
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [{
            role: 'user',
            parts: [{
              text: `Create concise English welcome copy for the MOME photo Memory Agent. Return JSON only with: greeting and 2 or 3 suggestions. Each suggestion requires id, label, query, acknowledgement. Suggestions should help find meaningful buildings, people, objects, or moments that can become physical journal stickers. Do not claim photos were analyzed and do not mention features outside photo exploration. Keep every field under 160 characters.`,
            }],
          }],
          config: { responseMimeType: 'application/json' },
        });
        return res.json(parseExplorationPrompt(JSON.parse(response.text || '{}')));
      } catch (error) {
        console.warn('Gemini onboarding copy unavailable; using neutral interface copy.', error instanceof Error ? error.message : String(error));
        return res.json(NEUTRAL_EXPLORATION_PROMPT);
      }
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const albumPhotos = Array.isArray(photos) ? photos : [];
    const latestMessage = messages[messages.length - 1]?.content || '';

    // If no API key configured, provide a structured intelligent local fallback
    if (!ai || !apiKey) {
      const matched = albumPhotos
        .filter((p: any) => p.isBuilding || (p.tags && p.tags.includes('建筑')))
        .slice(0, 4);
      const matchedIds = (matched.length > 0 ? matched : albumPhotos.slice(0, 3)).map(
        (p: any) => p.id || p.photoId
      );

      const actions: any[] = [];
      for (const id of matchedIds) {
        const item = albumPhotos.find((p: any) => (p.id || p.photoId) === id);
        actions.push({
          action: 'inspectPhoto',
          photoId: id,
          reason: `定位《${item?.name || '照片'}》`,
        });
        actions.push({
          action: 'selectPhoto',
          photoId: id,
          reason: `符合“${latestMessage.slice(0, 12)}”的结构特征`,
        });
      }
      actions.push({
        action: 'completeTask',
        reason: `已选定 ${matchedIds.length} 张候选素材`,
      });

      return res.json({
        reply: `（本地演示模式）已收到指令：“${latestMessage}”。我正在为你检查当前相册并锁定匹配的照片。`,
        suggestedActions: actions,
        matchedPhotoIds: matchedIds,
        isMock: true,
      });
    }

    const photosMeta = albumPhotos.map((p: any) => ({
      photoId: p.id || p.photoId,
      name: p.name,
      capturedAt: p.capturedAt || '未知',
      tags: p.tags || [],
      description: p.description || '',
      isBuilding: !!p.isBuilding,
      currentlySelected: (currentSelectedPhotoIds || []).includes(p.id || p.photoId),
    }));

    const systemInstruction = `
你是一款专为手机手账创作 App "mome" 打造的智能记忆探索 Agent（基于 Gemini 3.8 Flash）。
当前用户正在浏览一个相册，想要为你分配任务（如寻找特定的照片、挑出有质感的素材、整理手账拼贴片段），或咨询手账排版创作建议。

【当前相册照片清单（真实照片列表）】：
${JSON.stringify(photosMeta)}

【你的职责】：
1. 用温暖、亲和、专业、简洁的中文与用户对话。
2. 当用户的意图涉及寻找、筛选、挑选、高亮或操作当前相册中的照片时：
   - 仔细分析用户意图与每张照片的特征（照片名称、拍摄时间、标签、建筑标记与画面描述）。
   - 在返回结果中生成具体的动作序列 "suggestedActions"。
   - 动作支持：
     - "inspectPhoto": 巡视/定位照片。参数：photoId (必须来自上述清单), reason (简短中文依据，12字以内)
     - "highlightPhoto": 高亮重点观察。参数：photoId, reason
     - "selectPhoto": 选中作为候选手账素材。参数：photoId, reason (为什么适合手账)
     - "skipPhoto": 判定不适合当前要求并跳过。参数：photoId, reason (为什么跳过)
     - "completeTask": 任务巡视完成。参数：reason (总结)
   - 在 "matchedPhotoIds" 列表中填入最终判定应被选中的所有 photoId。
3. 如果用户只是进行日常打招呼、闲聊，或询问通用手账制作技巧，无需执行相册操作：
   - "suggestedActions" 返回空数组 []
   - "matchedPhotoIds" 返回空数组 []
   - 在 "reply" 中给出有帮助的回复，并提示用户可以输入什么相册查找指令。

你必须直接返回合法的 JSON 格式，严格符合以下结构：
{
  "reply": "对用户的自然语言回复（简明扼要，说明你的判断与建议）",
  "suggestedActions": [
    { "action": "inspectPhoto" | "highlightPhoto" | "selectPhoto" | "skipPhoto" | "completeTask", "photoId": "string", "reason": "string" }
  ],
  "matchedPhotoIds": ["string"]
}
`;

    // Construct contents
    const contents: any[] = [];

    // History turns (last 5)
    const recentMessages = messages.slice(-5);
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const msg = recentMessages[i];
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Latest user turn with image parts if available
    const latestTurnParts: any[] = [];
    for (const p of albumPhotos.slice(0, 8)) {
      const img = p.url || p.imageData;
      if (img && typeof img === 'string') {
        const matches = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          latestTurnParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
          latestTurnParts.push({
            text: `[照片 ID: ${p.id || p.photoId}, 名称: ${p.name}]`,
          });
        }
      }
    }
    latestTurnParts.push({ text: latestMessage });

    contents.push({
      role: 'user',
      parts: latestTurnParts,
    });

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let response: any = null;
    let lastErr: any = null;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });
        break;
      } catch (err: any) {
        lastErr = err;
        const isQuotaOrNotFound =
          err?.status === 429 ||
          err?.status === 404 ||
          (typeof err?.message === 'string' &&
            (err.message.includes('"code":429') || err.message.includes('RESOURCE_EXHAUSTED')));
        if (isQuotaOrNotFound) {
          continue;
        }
        throw err;
      }
    }

    if (!response && lastErr) {
      throw lastErr;
    }

    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        parsed = {
          reply: text,
          suggestedActions: [],
          matchedPhotoIds: [],
        };
      }
    }

    return res.json({
      reply: parsed.reply || '已为你分析完当前相册。',
      suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
      matchedPhotoIds: Array.isArray(parsed.matchedPhotoIds) ? parsed.matchedPhotoIds : [],
      isMock: false,
    });
  } catch (err: any) {
    console.error('Gemini chat-agent error:', err);
    return res.status(500).json({
      error: 'Gemini Agent 处理失败',
      message: err?.message || String(err),
    });
  }
});

const runMaterialSheetOnce = createIdempotentRunner<unknown>();

interface MaterialSheetInteractionResult {
  output_image?: { data?: string; mime_type?: string };
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; data?: string; mime_type?: string }>;
  }>;
}

// Printable Material Sheet Generation Route (Phase 2A)
// Fixed model: gemini-nano-banana-2.1
// Strict rules: single interaction call, NO retries, NO fallback models, NO mocks
app.post('/api/gemini/generate-material-sheet', async (req, res) => {
  try {
    if (!ai || !apiKey) {
      return res.status(503).json({
        code: 'GEMINI_NOT_CONFIGURED',
        stage: 'authentication',
        message: '服务端没有获取到 Gemini API 配置',
      });
    }
    let request;
    try {
      request = validateMaterialSheetRequest(req.body);
      const expectedKey = `${request.creationSessionId}:${request.subjectVersion}:${request.styleId}`;
      if (request.idempotencyKey !== expectedKey) throw new Error('idempotencyKey does not match the generation identity');
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    type InputPart =
      | { type: 'image'; data: string; mime_type: 'image/jpeg' | 'image/png' | 'image/webp' }
      | { type: 'text'; text: string };
    const inputParts: InputPart[] = [];
    for (const reference of request.referenceImages) {
      inputParts.push({
        type: 'image',
        data: reference.imageData,
        mime_type: reference.mimeType,
      });
      inputParts.push({
        type: 'text',
        text: `Reference image for photoId: ${reference.photoId}`,
      });
    }
    inputParts.push({ type: 'text', text: composeMaterialSheetPrompt(request) });

    // One logical generation per creationSessionId + subjectVersion + styleId.
    // No retry, model fallback, mock, or LocalMaterialProvider fallback.
    const interaction = await runMaterialSheetOnce(request.idempotencyKey, () =>
      ai.interactions.create({
        model: 'gemini-nano-banana-2.1',
        input: inputParts,
        response_modalities: [IMAGE_OUTPUT_CONFIG.type],
        generation_config: {
          image_config: {
            aspect_ratio: IMAGE_OUTPUT_CONFIG.aspect_ratio,
            image_size: IMAGE_OUTPUT_CONFIG.image_size,
          },
        },
      })
    ) as MaterialSheetInteractionResult;

    // 6. Extract Resulting Image
    let generatedBase64: string | undefined = interaction.output_image?.data;
    let generatedMimeType: string = interaction.output_image?.mime_type || 'image/png';

    if (!generatedBase64 && interaction.steps) {
      for (const step of interaction.steps) {
        if (step.type === 'model_output' && Array.isArray(step.content)) {
          for (const item of step.content) {
            if (item.type === 'image' && item.data) {
              generatedBase64 = item.data;
              if (item.mime_type) {
                generatedMimeType = item.mime_type;
              }
              break;
            }
          }
        }
        if (generatedBase64) {
          break;
        }
      }
    }

    if (!generatedBase64) {
      return res.status(500).json({
        error: 'Generation failed',
        message: '模型未能返回生成的素材页图片',
      });
    }

    const cleanOutputBase64 = generatedBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    // 7. Success Response HTTP 200
    return res.status(200).json({
      success: true,
      creationSessionId: request.creationSessionId,
      idempotencyKey: request.idempotencyKey,
      sheet: {
        mimeType: generatedMimeType,
        base64Data: cleanOutputBase64,
        dataUrl: `data:${generatedMimeType};base64,${cleanOutputBase64}`,
        generatedAt: Date.now(),
        aspectRatio: IMAGE_OUTPUT_CONFIG.aspect_ratio,
        imageSize: IMAGE_OUTPUT_CONFIG.image_size,
        printWidthMm: 58,
      },
    });
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error('generate-material-sheet error:', errorObj);
    return res.status(500).json({
      error: 'Material sheet generation failed',
      message: errorObj.message || '模型生成失败',
    });
  }
});


async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
