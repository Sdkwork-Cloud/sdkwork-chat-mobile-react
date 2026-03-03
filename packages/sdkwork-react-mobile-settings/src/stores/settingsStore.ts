import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState, AppConfig, ModelConfigItem, AIConfig } from '../types';
import { settingsService } from '../services/SettingsService';

interface SettingsStore extends SettingsState {
  loadConfig: () => Promise<void>;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  updateAIConfig: (domain: keyof AIConfig, settings: Partial<ModelConfigItem>) => Promise<void>;
  updateTheme: (theme: AppConfig['theme']) => Promise<void>;
  updateLanguage: (language: AppConfig['language']) => Promise<void>;
  resetAppearanceConfig: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      config: null,
      isLoading: false,
      error: null,

      loadConfig: async () => {
        set({ isLoading: true, error: null });
        try {
          const config = await settingsService.getConfig();
          set({ config, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateConfig: async (partial: Partial<AppConfig>) => {
        try {
          await settingsService.updateConfig(partial);
          const config = await settingsService.getConfig();
          set({ config });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      updateAIConfig: async (domain: keyof AIConfig, settings: Partial<ModelConfigItem>) => {
        try {
          await settingsService.updateAIConfig(domain, settings);
          const config = await settingsService.getConfig();
          set({ config });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      updateTheme: async (theme: AppConfig['theme']) => {
        await get().updateConfig({ theme });
      },

      updateLanguage: async (language: AppConfig['language']) => {
        await get().updateConfig({ language });
      },

      resetAppearanceConfig: async () => {
        try {
          await settingsService.resetAppearanceConfig();
          const config = await settingsService.getConfig();
          set({ config });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);
