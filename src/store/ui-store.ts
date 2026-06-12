import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { env } from '@/lib/env';

type ApiEnvironment = 'sandbox' | 'staging' | 'production';
export type ThemePreference = 'system' | 'light' | 'dark';

type UiState = {
  environment: ApiEnvironment;
  theme: ThemePreference;
  setEnvironment: (environment: ApiEnvironment) => void;
  setTheme: (theme: ThemePreference) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      environment: env.VITE_API_ENV,
      theme: 'system',
      setEnvironment: (environment) => {
        set({ environment });
      },
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: 'developer-portal-ui',
    },
  ),
);
