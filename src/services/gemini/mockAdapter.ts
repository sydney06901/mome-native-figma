/**
 * Mock Gemini Adapter (Explicitly Tagged as Mock / Local Mode)
 *
 * Rules:
 * - Clear identification: flagged with isMock = true.
 * - Deterministic logic based on actual metadata, tags, and query tokens.
 * - No fake arbitrary setTimeout disguised as model reasoning.
 * - Outputs valid PhotoAnalysis[] conforming strictly to domain types.
 */

import { PhotoAnalysis } from '../../domain/types.ts';
import { BatchAnalysisInput, BatchAnalysisResponse } from './types.ts';

export async function analyzePhotoBatchMock(
  input: BatchAnalysisInput
): Promise<BatchAnalysisResponse> {
  const query = input.userQuery.trim().toLowerCase();
  const results: PhotoAnalysis[] = [];

  // Keywords to detect
  const wantsBuilding =
    query.includes('建筑') ||
    query.includes('教堂') ||
    query.includes('拱门') ||
    query.includes('咖啡馆') ||
    query.includes('立面') ||
    query.includes('房屋') ||
    query.includes('街景');

  const wantsFood =
    query.includes('食物') ||
    query.includes('甜品') ||
    query.includes('蛋糕') ||
    query.includes('咖啡') ||
    query.includes('饮料');

  const wantsPlant =
    query.includes('植物') ||
    query.includes('花') ||
    query.includes('叶') ||
    query.includes('树') ||
    query.includes('自然');

  const wantsAnimal =
    query.includes('动物') ||
    query.includes('猫') ||
    query.includes('狗') ||
    query.includes('宠物');

  for (const photo of input.photos) {
    const meta = photo.metadata || {};
    const tags = meta.tags || [];
    const desc = (meta.description || '').toLowerCase();
    const fileName = (meta.fileName || '').toLowerCase();

    const isBuildingPhoto =
      meta.isBuilding === true ||
      tags.includes('建筑') ||
      tags.includes('街景') ||
      desc.includes('建筑') ||
      desc.includes('教堂') ||
      desc.includes('立面') ||
      fileName.includes('church') ||
      fileName.includes('cafe') ||
      fileName.includes('arch');

    const isFoodPhoto =
      tags.includes('食物') ||
      desc.includes('蛋糕') ||
      desc.includes('甜品') ||
      fileName.includes('dessert');

    const isPlantPhoto =
      tags.includes('植物') ||
      desc.includes('秋叶') ||
      desc.includes('树') ||
      fileName.includes('leaves');

    const isAnimalPhoto =
      tags.includes('动物') ||
      desc.includes('猫') ||
      fileName.includes('cat');

    let match = false;
    let confidence = 0.25;
    let reason = '未发现与所搜寻主题强相关的视觉主体。';
    let summary = meta.description || '日常纪实照片';
    const labels: string[] = [...tags];
    const detectedSubjects: string[] = [];

    if (wantsBuilding) {
      if (isBuildingPhoto) {
        match = true;
        confidence = 0.94;
        detectedSubjects.push('建筑结构', '门窗立面');
        labels.push('建筑', '街景');
        reason = '照片清晰展示了完整的立面轮廓与建筑透视特征。';
        summary = meta.description || '街区典型建筑立面';
      } else {
        match = false;
        confidence = 0.15;
        reason = '画面主体偏向细节微距或非建筑景观，未检测到典型建筑构件。';
      }
    } else if (wantsFood) {
      if (isFoodPhoto) {
        match = true;
        confidence = 0.92;
        detectedSubjects.push('餐品甜点');
        labels.push('食物', '美食');
        reason = '画面中央聚焦美食甜品，轮廓鲜明适于手账拼贴。';
      }
    } else if (wantsPlant) {
      if (isPlantPhoto) {
        match = true;
        confidence = 0.91;
        detectedSubjects.push('植物枝叶');
        labels.push('植物', '自然');
        reason = '植物纹理鲜明，色彩层次分明。';
      }
    } else if (wantsAnimal) {
      if (isAnimalPhoto) {
        match = true;
        confidence = 0.93;
        detectedSubjects.push('动物主体');
        labels.push('动物');
        reason = '检测到生动可爱的动物主体，边缘清晰。';
      }
    } else {
      // General match
      match = true;
      confidence = 0.75;
      reason = '照片与检索描述具备关联性。';
    }

    results.push({
      photoId: photo.photoId,
      summary,
      labels: Array.from(new Set(labels)),
      detectedSubjects: Array.from(new Set(detectedSubjects)),
      match,
      confidence: Math.min(1, Math.max(0, confidence)),
      reason,
      analyzedAt: new Date().toISOString(),
    });
  }

  return {
    results,
    isMock: true,
    modelUsed: 'mock-local-analyzer',
  };
}
