/**
 * LocalStorage Service - Lightweight User Preferences
 * Rule: Only stores language, theme, reduced motion, and lastOpenedProjectId.
 */

export interface AppSettings {
  language: 'zh-CN' | 'en';
  theme: 'light' | 'dark' | 'sepia';
  reducedMotion: boolean;
  lastOpenedProjectId: string | null;
}

const STORAGE_KEYS = {
  LANGUAGE: 'mome_setting_language',
  THEME: 'mome_setting_theme',
  REDUCED_MOTION: 'mome_setting_reduced_motion',
  LAST_PROJECT_ID: 'mome_setting_last_project_id',
} as const;

export const LocalSettings = {
  getLanguage(): 'zh-CN' | 'en' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'zh-CN' | 'en') || 'zh-CN';
  },

  setLanguage(lang: 'zh-CN' | 'en') {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getTheme(): 'light' | 'dark' | 'sepia' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as any) || 'light';
  },

  setTheme(theme: 'light' | 'dark' | 'sepia') {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getReducedMotion(): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION);
    if (stored !== null) return stored === 'true';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  },

  setReducedMotion(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, String(enabled));
  },

  getLastOpenedProjectId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_PROJECT_ID);
  },

  setLastOpenedProjectId(projectId: string | null) {
    if (projectId) {
      localStorage.setItem(STORAGE_KEYS.LAST_PROJECT_ID, projectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_PROJECT_ID);
    }
  },

  getAll(): AppSettings {
    return {
      language: this.getLanguage(),
      theme: this.getTheme(),
      reducedMotion: this.getReducedMotion(),
      lastOpenedProjectId: this.getLastOpenedProjectId(),
    };
  },
};
