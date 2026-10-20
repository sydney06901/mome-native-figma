import {
  GeneratedMaterial,
  MaterialGenerationProvider,
  MaterialGenerationRequest,
} from './types.ts';
import { LocalMaterialProvider } from './LocalMaterialProvider.ts';

export class GeminiMaterialProvider implements MaterialGenerationProvider {
  private localProvider = new LocalMaterialProvider();

  async generate(request: MaterialGenerationRequest): Promise<GeneratedMaterial[]> {
    // 1. Generate local physical and stylistic materials first
    const localMaterials = await this.localProvider.generate(request);

    // 2. For advanced diffusion/subject cutout models:
    // If not configured, transparently report without fake placeholders
    if (request.onProgress) {
      request.onProgress({
        current: localMaterials.length,
        total: localMaterials.length,
        stepDescription: '本地手账素材转换完成（高级模型抠图重绘服务待未来接入）。',
      });
    }

    return localMaterials;
  }
}
