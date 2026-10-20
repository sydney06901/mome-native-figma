import type { MomePhoto, MomeSession, PrintableSheet } from '../domain';

type StoreName = 'momeSessions' | 'momePhotos' | 'momeLibrarySheets' | 'momeMeta';

export interface MomeStorageAdapter {
  get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined>;
  getAll<T>(store: StoreName): Promise<T[]>;
  put<T>(store: StoreName, value: T): Promise<void>;
  delete(store: StoreName, key: IDBValidKey): Promise<void>;
}

export class MomeStorageError extends Error {
  constructor(
    readonly code: 'STORAGE_QUOTA' | 'STORAGE_FAILED',
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'MomeStorageError';
  }
}

function mapStorageError(error: unknown): MomeStorageError {
  if (error instanceof MomeStorageError) return error;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const isQuota =
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
  const message = isQuota
    ? rawMessage.replace(/^QuotaExceededError:\s*/i, '')
    : rawMessage;
  return new MomeStorageError(isQuota ? 'STORAGE_QUOTA' : 'STORAGE_FAILED', message, {
    cause: error,
  });
}

function cloneForMemory<T>(value: T): T {
  if (value instanceof Blob) return value;
  if (Array.isArray(value)) return value.map(cloneForMemory) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneForMemory(entry)]),
    ) as T;
  }
  return value;
}

export class InMemoryMomeStorage implements MomeStorageAdapter {
  private stores = new Map<StoreName, Map<IDBValidKey, unknown>>();

  private store(name: StoreName): Map<IDBValidKey, unknown> {
    const current = this.stores.get(name);
    if (current) return current;
    const created = new Map<IDBValidKey, unknown>();
    this.stores.set(name, created);
    return created;
  }

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
    const value = this.store(store).get(key);
    return value === undefined ? undefined : cloneForMemory(value as T);
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    return [...this.store(store).values()].map((value) => cloneForMemory(value as T));
  }

  async put<T>(store: StoreName, value: T): Promise<void> {
    const record = value as T & { id?: IDBValidKey; key?: IDBValidKey };
    const key = record.id ?? record.key;
    if (key === undefined) throw new Error(`Record for ${store} is missing id/key`);
    this.store(store).set(key, cloneForMemory(value));
  }

  async delete(store: StoreName, key: IDBValidKey): Promise<void> {
    this.store(store).delete(key);
  }
}

class IndexedDbMomeStorage implements MomeStorageAdapter {
  private databasePromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this browser'));
        return;
      }
      const request = indexedDB.open('mome_journal_db', 4);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('momeSessions')) {
          database.createObjectStore('momeSessions', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('momePhotos')) {
          database.createObjectStore('momePhotos', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('momeLibrarySheets')) {
          database.createObjectStore('momeLibrarySheets', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('momeMeta')) {
          database.createObjectStore('momeMeta', { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'));
    });
    return this.databasePromise;
  }

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(store, 'readonly').objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(store, 'readonly').objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(store: StoreName, value: T): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(store, 'readwrite');
      transaction.objectStore(store).put(value);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  async delete(store: StoreName, key: IDBValidKey): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(store, 'readwrite');
      transaction.objectStore(store).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }
}

interface ActiveSessionRecord {
  key: 'activeSession';
  sessionId: string;
}

export class MomeRepository {
  constructor(private readonly storage: MomeStorageAdapter = new IndexedDbMomeStorage()) {}

  async saveSession(session: MomeSession): Promise<void> {
    try {
      await this.storage.put('momeSessions', session);
      await this.storage.put<ActiveSessionRecord>('momeMeta', {
        key: 'activeSession',
        sessionId: session.id,
      });
    } catch (error) {
      throw mapStorageError(error);
    }
  }

  async loadActiveSession(): Promise<MomeSession | null> {
    try {
      const active = await this.storage.get<ActiveSessionRecord>('momeMeta', 'activeSession');
      if (!active) return null;
      return (await this.storage.get<MomeSession>('momeSessions', active.sessionId)) ?? null;
    } catch (error) {
      throw mapStorageError(error);
    }
  }

  async clearActiveSession(): Promise<void> {
    try {
      await this.storage.delete('momeMeta', 'activeSession');
    } catch (error) {
      throw mapStorageError(error);
    }
  }

  async savePhoto(photo: MomePhoto): Promise<void> {
    try {
      await this.storage.put('momePhotos', photo);
    } catch (error) {
      throw mapStorageError(error);
    }
  }

  async loadPhotos(sessionId: string): Promise<MomePhoto[]> {
    try {
      const photos = await this.storage.getAll<MomePhoto>('momePhotos');
      return photos.filter((item) => item.sessionId === sessionId);
    } catch (error) {
      throw mapStorageError(error);
    }
  }

  async saveLibrarySheet(sheet: PrintableSheet): Promise<void> {
    if (!sheet.libraryEligible) return;
    try {
      await this.storage.put('momeLibrarySheets', sheet);
    } catch (error) {
      throw mapStorageError(error);
    }
  }

  async loadLibrarySheets(): Promise<PrintableSheet[]> {
    try {
      const sheets = await this.storage.getAll<PrintableSheet>('momeLibrarySheets');
      return sheets.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      throw mapStorageError(error);
    }
  }
}

export const momeRepository = new MomeRepository();
