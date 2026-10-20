import { Project } from '../models/Project.ts';
import { PhotoItem } from '../models/PhotoItem.ts';
import { Material } from '../models/Material.ts';
import { PhysicalMaterial } from '../models/PhysicalMaterial.ts';
import {
  DEMO_PROJECT_ID,
  INITIAL_DEMO_PHOTOS,
  DEMO_PHOTO_SKETCHES,
  create5DiverseMemoryMaterials,
  svgToDataUrl,
} from './demoAssets.ts';
import { EXPANDED_PHYSICAL_MATERIALS } from './physicalMaterialPresets.ts';

const DB_NAME = 'mome_journal_db';
const DB_VERSION = 1;

interface DBSchema {
  projects: Project;
  photos: PhotoItem;
  materials: Material;
  physicalMaterials: PhysicalMaterial;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
        photoStore.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('materials')) {
        const matStore = db.createObjectStore('materials', { keyPath: 'id' });
        matStore.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('physicalMaterials')) {
        db.createObjectStore('physicalMaterials', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Seed initial Demo Project if first time
export async function initDatabase(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['projects', 'photos', 'materials', 'physicalMaterials'], 'readwrite');
  const projectStore = tx.objectStore('projects');

  const countReq = projectStore.count();
  await new Promise<void>((resolve, reject) => {
    countReq.onsuccess = async () => {
      if (countReq.result === 0) {
        // Seed default demo project
        const demoProject: Project = {
          id: DEMO_PROJECT_ID,
          name: '周六漫步·街景与建筑手记',
          coverUrl: INITIAL_DEMO_PHOTOS[0].url,
          createdAt: Date.now() - 3600000 * 24,
          updatedAt: Date.now() - 3600000 * 2,
          isDemo: true,
          description: '2026年10月10日周六漫步拍摄的照片，包含老教堂、咖啡馆立面与公园建筑。',
          targetDate: '2026-10-10',
          targetKeyword: '建筑',
          stylePreference: '黑白线稿',
          candidatePhotoIds: ['demo-photo-church', 'demo-photo-cafe', 'demo-photo-arch'],
          canvasLayers: [],
        };
        projectStore.put(demoProject);

        // Seed demo photos
        const photoStore = tx.objectStore('photos');
        for (const photo of INITIAL_DEMO_PHOTOS) {
          photoStore.put(photo);
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

        // Seed 5 diverse materials: 动物、指示牌、食物、植物、物品
        const diverseMaterials = create5DiverseMemoryMaterials(DEMO_PROJECT_ID);
        for (const dm of diverseMaterials) {
          matStore.put(dm);
        }

        // Seed default physical materials (All 36 items across 5 categories)
        const pmStore = tx.objectStore('physicalMaterials');
        for (const pm of EXPANDED_PHYSICAL_MATERIALS) {
          pmStore.put(pm);
        }
      }
      resolve();
    };
    countReq.onerror = () => reject(countReq.error);
  });
}

// ================= Projects =================
export async function getProjects(): Promise<Project[]> {
  await initDatabase();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readonly');
    const req = tx.objectStore('projects').getAll();
    req.onsuccess = () => {
      const list = req.result as Project[];
      // Sort by updatedAt descending
      list.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getProject(id: string): Promise<Project | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readonly');
    const req = tx.objectStore('projects').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProject(project: Project): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readwrite');
    project.updatedAt = Date.now();
    const req = tx.objectStore('projects').put(project);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['projects', 'photos'], 'readwrite');
    tx.objectStore('projects').delete(id);
    // Also remove photos assigned to this project
    const photoStore = tx.objectStore('photos');
    const index = photoStore.index('projectId');
    const req = index.getAllKeys(id);
    req.onsuccess = () => {
      const keys = req.result;
      keys.forEach((k) => photoStore.delete(k));
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// ================= Photos =================
export async function getPhotosByProject(projectId: string): Promise<PhotoItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const index = tx.objectStore('photos').index('projectId');
    const req = index.getAll(projectId);
    req.onsuccess = () => resolve(req.result as PhotoItem[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getPhotoById(photoId: string): Promise<PhotoItem | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const req = tx.objectStore('photos').get(photoId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhoto(photo: PhotoItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const req = tx.objectStore('photos').put(photo);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function savePhotos(photos: PhotoItem[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    for (const p of photos) {
      store.put(p);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const req = tx.objectStore('photos').delete(photoId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const DEMO_PHOTO_CAPTURED_AT_MAP: Record<string, string> = {
  'demo-photo-church': '2026-10-10 14:30',
  'demo-photo-cafe': '2026-10-10 10:15',
  'demo-photo-arch': '2026-10-10 16:45',
  'demo-photo-leaves': '2026-10-10 15:40',
  'demo-photo-dessert': '2026-10-10 11:20',
  'demo-photo-cat': '2026-10-10 13:50',
};

// ================= Materials =================
export async function getMaterials(): Promise<Material[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('materials', 'readwrite');
    const store = tx.objectStore('materials');
    const req = store.getAll();
    req.onsuccess = async () => {
      let list = req.result as Material[];
      // If only 1 material exists (church sketch), populate the 5 diverse items
      if (list.length <= 1) {
        const extra5 = create5DiverseMemoryMaterials(DEMO_PROJECT_ID);
        for (const item of extra5) {
          store.put(item);
        }
        list = [...list, ...extra5];
      }

      // Ensure at least one original crop cutout material exists for type sorting demonstration
      if (!list.some((m) => m.type === 'crop') && INITIAL_DEMO_PHOTOS[1]) {
        const sampleCrop: Material = {
          id: 'demo-material-cafe-crop',
          projectId: DEMO_PROJECT_ID,
          projectName: '周六漫步·街景与建筑手记',
          sourcePhotoId: 'demo-photo-cafe',
          sourcePhotoUrl: INITIAL_DEMO_PHOTOS[1].url,
          name: '街角转角咖啡馆·原图裁剪',
          type: 'crop',
          previewUrl: INITIAL_DEMO_PHOTOS[1].url,
          fullUrl: INITIAL_DEMO_PHOTOS[1].url,
          style: 'line_art',
          isDemo: true,
          capturedAt: '2026-10-10 10:15',
          createdAt: Date.now() - 3600000 * 6,
        };
        store.put(sampleCrop);
        list.push(sampleCrop);
      }

      // Ensure every material has capturedAt populated
      for (const m of list) {
        if (!m.capturedAt) {
          m.capturedAt = DEMO_PHOTO_CAPTURED_AT_MAP[m.sourcePhotoId] || '2026-10-10 12:00';
          store.put(m);
        }
      }

      list.sort((a, b) => b.createdAt - a.createdAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function generateAndSave5DiverseMaterials(projectId: string = DEMO_PROJECT_ID): Promise<Material[]> {
  const new5 = create5DiverseMemoryMaterials(projectId);
  const db = await openDB();
  const tx = db.transaction('materials', 'readwrite');
  const store = tx.objectStore('materials');
  for (const item of new5) {
    store.put(item);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return getMaterials();
}

export async function getMaterialsByProject(projectId: string): Promise<Material[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('materials', 'readonly');
    const index = tx.objectStore('materials').index('projectId');
    const req = index.getAll(projectId);
    req.onsuccess = () => {
      const list = req.result as Material[];
      list.sort((a, b) => b.createdAt - a.createdAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('materials', 'readonly');
    const req = tx.objectStore('materials').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMaterial(material: Material): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('materials', 'readwrite');
    const req = tx.objectStore('materials').put(material);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('materials', 'readwrite');
    const req = tx.objectStore('materials').delete(materialId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ================= Physical Materials =================
export async function getPhysicalMaterials(): Promise<PhysicalMaterial[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('physicalMaterials', 'readwrite');
    const store = tx.objectStore('physicalMaterials');
    const req = store.getAll();
    req.onsuccess = () => {
      let list = req.result as PhysicalMaterial[];
      // If list does not have all expanded items, supplement them
      const existingIds = new Set(list.map((m) => m.id));
      let hasNew = false;
      for (const item of EXPANDED_PHYSICAL_MATERIALS) {
        if (!existingIds.has(item.id)) {
          store.put(item);
          list.push(item);
          hasNew = true;
        }
      }
      list.sort((a, b) => b.createdAt - a.createdAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function savePhysicalMaterial(item: PhysicalMaterial): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('physicalMaterials', 'readwrite');
    const req = tx.objectStore('physicalMaterials').put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhysicalMaterial(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('physicalMaterials', 'readwrite');
    const req = tx.objectStore('physicalMaterials').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ================= Reset All Data =================
export async function resetAllData(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['projects', 'photos', 'materials', 'physicalMaterials'], 'readwrite');
  tx.objectStore('projects').clear();
  tx.objectStore('photos').clear();
  tx.objectStore('materials').clear();
  tx.objectStore('physicalMaterials').clear();

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  // Re-seed demo data
  await initDatabase();
}
