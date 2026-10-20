import { Task, TaskStatusType } from '../models/Task.ts';

/**
 * apiAIService represents the production-ready adapter layer for subsequent
 * cloud-hosted AI endpoints.
 *
 * Rules:
 * - Does NOT fake HTTP 200 responses when backend is unconfigured.
 * - Explicitly tells user that Cloud AI service is in adapter mode.
 * - Defines clean typed schemas for POST /v1/tasks/parse, POST /v1/uploads,
 *   POST /v1/analyses, GET /v1/jobs/{id}, POST /v1/generations,
 *   POST /v1/jobs/{id}/cancel, GET /v1/assets/{id}.
 */

export interface ParseTaskRequest {
  query: string;
}

export interface ParseTaskResponse {
  targetDate?: string;
  targetCategory?: string;
  targetStyle?: string;
}

export interface AnalysisJobResponse {
  jobId: string;
  status: TaskStatusType;
  stageName: string;
  candidateAssetIds: string[];
}

export interface GenerationJobResponse {
  jobId: string;
  status: TaskStatusType;
  stageName: string;
  materialId?: string;
  assetUrl?: string;
}

class ApiAIService {
  private baseUrl: string | null = null; // Can be configured via settings in the future

  getBaseUrl(): string | null {
    return this.baseUrl;
  }

  isConfigured(): boolean {
    return !!this.baseUrl;
  }

  setBaseUrl(url: string | null) {
    this.baseUrl = url;
  }

  async parseQuery(query: string): Promise<ParseTaskResponse> {
    if (!this.baseUrl) {
      throw new Error('云端 AI 解析接口尚未配置接入地址 (预留适配层已就绪)');
    }
    const res = await fetch(`${this.baseUrl}/v1/tasks/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`云端接口响应异常: ${res.statusText}`);
    return res.json();
  }

  async uploadPhoto(file: File): Promise<{ assetId: string; url: string }> {
    if (!this.baseUrl) {
      throw new Error('云端照片上传存储服务尚未连接');
    }
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${this.baseUrl}/v1/uploads`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`上传失败: ${res.statusText}`);
    return res.json();
  }

  async createAnalysisJob(params: {
    photoIds: string[];
    targetCategory: string;
    targetDate?: string;
  }): Promise<{ jobId: string }> {
    if (!this.baseUrl) {
      throw new Error('云端视觉分析服务未接入');
    }
    const res = await fetch(`${this.baseUrl}/v1/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`创建分析作业失败: ${res.statusText}`);
    return res.json();
  }

  async getJobStatus(jobId: string): Promise<AnalysisJobResponse | GenerationJobResponse> {
    if (!this.baseUrl) {
      throw new Error('作业查询服务未接入');
    }
    const res = await fetch(`${this.baseUrl}/v1/jobs/${jobId}`);
    if (!res.ok) throw new Error(`查询作业状态失败: ${res.statusText}`);
    return res.json();
  }

  async createGenerationJob(params: {
    assetId: string;
    style: string;
  }): Promise<{ jobId: string }> {
    if (!this.baseUrl) {
      throw new Error('云端插画生成服务尚未接入');
    }
    const res = await fetch(`${this.baseUrl}/v1/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`生图任务发起失败: ${res.statusText}`);
    return res.json();
  }

  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    if (!this.baseUrl) {
      throw new Error('取消作业失败: 服务未连接');
    }
    const res = await fetch(`${this.baseUrl}/v1/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`取消作业失败: ${res.statusText}`);
    return res.json();
  }

  async getAsset(assetId: string): Promise<{ assetId: string; url: string; metadata: any }> {
    if (!this.baseUrl) {
      throw new Error('素材检索失败: 服务未连接');
    }
    const res = await fetch(`${this.baseUrl}/v1/assets/${assetId}`);
    if (!res.ok) throw new Error(`获取素材失败: ${res.statusText}`);
    return res.json();
  }
}

export const apiAIService = new ApiAIService();
