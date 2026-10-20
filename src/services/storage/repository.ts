/**
 * Storage Repository - IndexedDB Layer
 * Handles persistence for Projects, PhotoAssets, PhotoAnalyses, Candidates,
 * Materials, and PhysicalMaterials.
 */

import {
  Project,
  PhotoAsset,
  PhotoAnalysis,
  Candidate,
  SearchTask,
  MaterialCreationSession,
  MaterialSourcePhoto,
} from '../../domain/types.ts';
import { Material } from '../../models/Material.ts';
import { PhysicalMaterial } from '../../models/PhysicalMaterial.ts';
import {
  DEMO_PROJECT_ID,
  INITIAL_DEMO_PHOTOS,
  DEMO_PHOTO_SKETCHES,
  create5DiverseMemoryMaterials,
  svgToDataUrl,
} from '../demoAssets.ts';
import { EXPANDED_PHYSICAL_MATERIALS } from '../physicalMaterialPresets.ts';

const DB_NAME = 'mome_journal_db';
const DB_VERSION = 3;

export interface IStorageRepository {
  init(): Promise<void>;
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  getPhotoAssets(projectId: string): Promise<PhotoAsset[]>;
  getPhotoAsset(id: string): Promise<PhotoAsset | null>;
  savePhotoAssets(photos: PhotoAsset[]): Promise<void>;
  savePhotoAsset(photo: PhotoAsset): Promise<void>;
  deletePhotoAsset(id: string): Promise<void>;
  getAnalyses(projectId: string): Promise<PhotoAnalysis[]>;
  saveAnalysis(analysis: PhotoAnalysis): Promise<void>;
  saveAnalyses(analyses: PhotoAnalysis[]): Promise<void>;
  getCandidates(projectId: string): Promise<Candidate[]>;
  saveCandidates(projectId: string, candidates: Candidate[]): Promise<void>;
  getMaterials(): Promise<Material[]>;
  getMaterialsByProject(projectId: string): Promise<Material[]>;
  getMaterialById(id: string): Promise<Material | null>;
  saveMaterial(material: Material): Promise<void>;
  deleteMaterial(materialId: string): Promise<void>;
  getPhysicalMaterials(): Promise<PhysicalMaterial[]>;
  savePhysicalMaterial(item: PhysicalMaterial): Promise<void>;
  deletePhysicalMaterial(id: string): Promise<void>;
  saveCreationSession(session: MaterialCreationSession): Promise<void>;
  getCreationSession(id: string): Promise<MaterialCreationSession | null>;
  getCreationSessionsBySource(sourceExploreSessionId: string): Promise<MaterialCreationSession[]>;
  saveMaterialSourcePhotos(photos: MaterialSourcePhoto[]): Promise<void>;
  getMaterialSourcePhotos(creationSessionId: string): Promise<MaterialSourcePhoto[]>;
  resetAll(): Promise<void>;
}

class IndexedDBRepository implements IStorageRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private onStorageErrorCallback: ((err: Error) => void) | null = null;

  setOnStorageError(cb: (err: Error) => void) {
    this.onStorageErrorCallback = cb;
  }

  private handleStorageError(err: any): Error {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    if (this.onStorageErrorCallback) {
      this.onStorageErrorCallback(errorObj);
    }
    return errorObj;
  }

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('当前浏览器不支持 IndexedDB 本地数据存储'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Projects
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        // Photos / PhotoAssets
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('projectId', 'projectId', { unique: false });
        }
        // Analyses
        if (!db.objectStoreNames.contains('analyses')) {
          db.createObjectStore('analyses', { keyPath: 'photoId' });
        }
        // Candidates
        if (!db.objectStoreNames.contains('candidates')) {
          const candStore = db.createObjectStore('candidates', { keyPath: 'photoId' });
          candStore.createIndex('projectId', 'projectId', { unique: false });
        }
        // Materials (Stickers / Sketches / Crops)
        if (!db.objectStoreNames.contains('materials')) {
          const matStore = db.createObjectStore('materials', { keyPath: 'id' });
          matStore.createIndex('projectId', 'projectId', { unique: false });
        }
        // Physical Materials (Papers, Tapes, 3D, Tickets, Stickers)
        if (!db.objectStoreNames.contains('physicalMaterials')) {
          db.createObjectStore('physicalMaterials', { keyPath: 'id' });
        }
        // Material Creation Sessions
        if (!db.objectStoreNames.contains('materialCreationSessions')) {
          const sessionStore = db.createObjectStore('materialCreationSessions', { keyPath: 'id' });
          sessionStore.createIndex('sourceExploreSessionId', 'sourceExploreSessionId', { unique: false });
        }
        // Material Source Photos
        if (!db.objectStoreNames.contains('materialSourcePhotos')) {
          const sourceStore = db.createObjectStore('materialSourcePhotos', { keyPath: 'id' });
          sourceStore.createIndex('creationSessionId', 'creationSessionId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        const err = this.handleStorageError(request.error);
        reject(err);
      };
    });

    return this.dbPromise;
  }

  async init(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(
      ['projects', 'photos', 'materials', 'physicalMaterials'],
      'readwrite'
    );
    const projectStore = tx.objectStore('projects');

    const countReq = projectStore.count();
    await new Promise<void>((resolve, reject) => {
      countReq.onsuccess = async () => {
        if (countReq.result === 0) {
          // Seed default demo project
          const demoProject: Project = {
            id: DEMO_PROJECT_ID,
            title: '周六漫步·街景与建筑手记',
            name: '周六漫步·街景与建筑手记',
            coverUrl: INITIAL_DEMO_PHOTOS[0].url,
            createdAt: Date.now() - 3600000 * 24,
            updatedAt: Date.now() - 3600000 * 2,
            isDemo: true,
            description: '2026年10月10日周六漫步拍摄的照片，包含老教堂、咖啡馆立面与公园建筑。',
            targetDate: '2026-10-10',
            targetKeyword: '建筑',
            stylePreference: '黑白线稿',
            sourcePhotoIds: INITIAL_DEMO_PHOTOS.map((p) => p.id),
            candidatePhotoIds: ['demo-photo-church', 'demo-photo-cafe', 'demo-photo-arch'],
            stickerIds: ['demo-material-church-sketch'],
            canvasLayers: [],
            canvasState: { layers: [] },
          };
          projectStore.put(demoProject);

          // Seed demo photos as PhotoAssets
          const photoStore = tx.objectStore('photos');
          for (const photo of INITIAL_DEMO_PHOTOS) {
            const asset: PhotoAsset = {
              id: photo.id,
              projectId: DEMO_PROJECT_ID,
              fileName: `${photo.name}.jpg`,
              mimeType: 'image/jpeg',
              width: photo.width || 800,
              height: photo.height || 600,
              createdAt: new Date().toISOString(),
              capturedAt: photo.capturedAt || '2026-10-10 14:30',
              objectUrl: photo.url,
              thumbnailUrl: photo.url,
              importStatus: 'ready',
              analysisStatus: photo.isBuilding ? 'analyzed' : 'unprocessed',
              tags: photo.tags,
              isBuilding: photo.isBuilding,
              isDemo: true,
              description: photo.description,
            };
            photoStore.put(asset);
          }

          // Seed initial demo material: Church Sketch
          const matStore = tx.objectStore('materials');
          const churchSketch = DEMO_PHOTO_SKETCHES['demo-photo-church'];
          const demoMaterial: Material = {
            id: 'demo-material-church-sketch',
            projectId: DEMO_PROJECT_ID,
            projectName: demoProject.name,
            sourcePhotoId: 'demo-photo-church',
            sourcePhotoUrl: INITIAL_DEMO_PHOTOS[0].url,
            name: churchSketch.name,
            type: 'ai_sketch',
            previewUrl: svgToDataUrl(churchSketch.svg),
            fullUrl: svgToDataUrl(churchSketch.svg),
            style: 'line_art',
            isDemo: true,
            isDemoSketch: true,
            createdAt: Date.now() - 3600000 * 5,
          };
          matStore.put(demoMaterial);

          // Seed 5 diverse materials
          const diverseMaterials = create5DiverseMemoryMaterials(DEMO_PROJECT_ID);
          for (const dm of diverseMaterials) {
            matStore.put(dm);
          }

          // Seed default physical materials
          const pmStore = tx.objectStore('physicalMaterials');
          for (const pm of EXPANDED_PHYSICAL_MATERIALS) {
            pmStore.put(pm);
          }
        }
        resolve();
      };
      countReq.onerror = () => reject(this.handleStorageError(countReq.error));
    });
  }

  // ================= Projects =================
  async getProjects(): Promise<Project[]> {
    await this.init();
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readonly');
      const req = tx.objectStore('projects').getAll();
      req.onsuccess = () => {
        const list = (req.result as any[]).map((p) => ({
          ...p,
          title: p.title || p.name,
          name: p.name || p.title,
          sourcePhotoIds: p.sourcePhotoIds || [],
          stickerIds: p.stickerIds || [],
          canvasState: p.canvasState || { layers: p.canvasLayers || [] },
        })) as Project[];
        list.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
        resolve(list);
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async getProject(id: string): Promise<Project | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readonly');
      const req = tx.objectStore('projects').get(id);
      req.onsuccess = () => {
        if (!req.result) {
          resolve(null);
          return;
        }
        const p = req.result;
        resolve({
          ...p,
          title: p.title || p.name,
          name: p.name || p.title,
          sourcePhotoIds: p.sourcePhotoIds || [],
          stickerIds: p.stickerIds || [],
          canvasState: p.canvasState || { layers: p.canvasLayers || [] },
        });
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readwrite');
      project.updatedAt = Date.now();
      if (!project.title && project.name) project.title = project.name;
      if (!project.name && project.title) project.name = project.title;
      const req = tx.objectStore('projects').put(project);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['projects', 'photos'], 'readwrite');
      tx.objectStore('projects').delete(id);
      const photoStore = tx.objectStore('photos');
      const index = photoStore.index('projectId');
      const req = index.getAllKeys(id);
      req.onsuccess = () => {
        const keys = req.result;
        keys.forEach((k) => photoStore.delete(k));
        resolve();
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  // ================= PhotoAssets =================
  async getPhotoAssets(projectId: string): Promise<PhotoAsset[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readonly');
      const index = tx.objectStore('photos').index('projectId');
      const req = index.getAll(projectId);
      req.onsuccess = () => {
        const list = (req.result as any[]).map((p) => {
          let thumbUrl = p.thumbnailUrl || p.objectUrl || p.url;
          // Reconstruct object URL from saved Blob across reloads
          if (p.thumbnailBlob instanceof Blob) {
            try {
              thumbUrl = URL.createObjectURL(p.thumbnailBlob);
            } catch {
              // fallback to stored url
            }
          } else if (p.originalBlob instanceof Blob) {
            try {
              thumbUrl = URL.createObjectURL(p.originalBlob);
            } catch {
              // fallback
            }
          }
          return {
            ...p,
            fileName: p.fileName || `${p.name || 'photo'}.jpg`,
            mimeType: p.mimeType || 'image/jpeg',
            objectUrl: thumbUrl,
            thumbnailUrl: thumbUrl,
            importStatus: p.importStatus || 'ready',
            analysisStatus: p.analysisStatus || (p.isBuilding ? 'analyzed' : 'unprocessed'),
          };
        }) as PhotoAsset[];
        resolve(list);
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async getPhotoAsset(id: string): Promise<PhotoAsset | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readonly');
      const req = tx.objectStore('photos').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async savePhotoAsset(photo: PhotoAsset): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const req = tx.objectStore('photos').put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async savePhotoAssets(photos: PhotoAsset[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const store = tx.objectStore('photos');
      for (const p of photos) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(this.handleStorageError(tx.error));
    });
  }

  async deletePhotoAsset(photoId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos', 'readwrite');
      const req = tx.objectStore('photos').delete(photoId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  // ================= Analyses =================
  async getAnalyses(projectId: string): Promise<PhotoAnalysis[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('analyses', 'readonly');
      const req = tx.objectStore('analyses').getAll();
      req.onsuccess = () => resolve(req.result as PhotoAnalysis[]);
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async saveAnalysis(analysis: PhotoAnalysis): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('analyses', 'readwrite');
      const req = tx.objectStore('analyses').put(analysis);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async saveAnalyses(analyses: PhotoAnalysis[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('analyses', 'readwrite');
      const store = tx.objectStore('analyses');
      for (const item of analyses) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(this.handleStorageError(tx.error));
    });
  }

  // ================= Candidates =================
  async getCandidates(projectId: string): Promise<Candidate[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('candidates', 'readonly');
      const req = tx.objectStore('candidates').getAll();
      req.onsuccess = () => resolve(req.result as Candidate[]);
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async saveCandidates(projectId: string, candidates: Candidate[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('candidates', 'readwrite');
      const store = tx.objectStore('candidates');
      for (const cand of candidates) {
        store.put({ ...cand, projectId });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(this.handleStorageError(tx.error));
    });
  }

  // ================= Materials =================
  async getMaterials(): Promise<Material[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materials', 'readwrite');
      const store = tx.objectStore('materials');
      const req = store.getAll();
      req.onsuccess = () => {
        let list = req.result as Material[];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async getMaterialsByProject(projectId: string): Promise<Material[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materials', 'readonly');
      const index = tx.objectStore('materials').index('projectId');
      const req = index.getAll(projectId);
      req.onsuccess = () => {
        const list = req.result as Material[];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async getMaterialById(id: string): Promise<Material | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materials', 'readonly');
      const req = tx.objectStore('materials').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async saveMaterial(material: Material): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materials', 'readwrite');
      const req = tx.objectStore('materials').put(material);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async deleteMaterial(materialId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materials', 'readwrite');
      const req = tx.objectStore('materials').delete(materialId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  // ================= Physical Materials =================
  async getPhysicalMaterials(): Promise<PhysicalMaterial[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('physicalMaterials', 'readwrite');
      const store = tx.objectStore('physicalMaterials');
      const req = store.getAll();
      req.onsuccess = () => {
        let list = req.result as PhysicalMaterial[];
        const existingIds = new Set(list.map((m) => m.id));
        for (const item of EXPANDED_PHYSICAL_MATERIALS) {
          if (!existingIds.has(item.id)) {
            store.put(item);
            list.push(item);
          }
        }
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async savePhysicalMaterial(item: PhysicalMaterial): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('physicalMaterials', 'readwrite');
      const req = tx.objectStore('physicalMaterials').put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async deletePhysicalMaterial(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('physicalMaterials', 'readwrite');
      const req = tx.objectStore('physicalMaterials').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  // ================= Material Creation Sessions =================
  async saveCreationSession(session: MaterialCreationSession): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materialCreationSessions', 'readwrite');
      session.updatedAt = Date.now();
      const req = tx.objectStore('materialCreationSessions').put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async getCreationSession(id: string): Promise<MaterialCreationSession | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materialCreationSessions', 'readonly');
      const req = tx.objectStore('materialCreationSessions').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async getCreationSessionsBySource(sourceExploreSessionId: string): Promise<MaterialCreationSession[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materialCreationSessions', 'readonly');
      const index = tx.objectStore('materialCreationSessions').index('sourceExploreSessionId');
      const req = index.getAll(sourceExploreSessionId);
      req.onsuccess = () => {
        const list = (req.result || []) as MaterialCreationSession[];
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list);
      };
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  async saveMaterialSourcePhotos(photos: MaterialSourcePhoto[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materialSourcePhotos', 'readwrite');
      const store = tx.objectStore('materialSourcePhotos');
      for (const p of photos) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(this.handleStorageError(tx.error));
    });
  }

  async getMaterialSourcePhotos(creationSessionId: string): Promise<MaterialSourcePhoto[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('materialSourcePhotos', 'readonly');
      const index = tx.objectStore('materialSourcePhotos').index('creationSessionId');
      const req = index.getAll(creationSessionId);
      req.onsuccess = () => resolve((req.result || []) as MaterialSourcePhoto[]);
      req.onerror = () => reject(this.handleStorageError(req.error));
    });
  }

  // ================= Reset =================
  async resetAll(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(
      [
        'projects',
        'photos',
        'analyses',
        'candidates',
        'materials',
        'physicalMaterials',
        'materialCreationSessions',
        'materialSourcePhotos',
      ],
      'readwrite'
    );
    tx.objectStore('projects').clear();
    tx.objectStore('photos').clear();
    tx.objectStore('analyses').clear();
    tx.objectStore('candidates').clear();
    tx.objectStore('materials').clear();
    tx.objectStore('physicalMaterials').clear();
    tx.objectStore('materialCreationSessions').clear();
    tx.objectStore('materialSourcePhotos').clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(this.handleStorageError(tx.error));
    });

    await this.init();
  }
}

export const storageRepository = new IndexedDBRepository();
