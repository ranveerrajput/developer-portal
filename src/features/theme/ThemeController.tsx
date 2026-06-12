import { useEffect } from 'react';

import { resolveThemePreference } from '@/features/theme/theme-utils';
import { useUiStore } from '@/store/ui-store';

export function ThemeController() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      const resolvedTheme = resolveThemePreference(theme, mediaQuery.matches);
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
      document.documentElement.style.colorScheme = resolvedTheme;
    }

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [theme]);

  return null;
}
