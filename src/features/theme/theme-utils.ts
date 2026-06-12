import type { ThemePreference } from '@/store/ui-store';

export function resolveThemePreference(
  preference: ThemePreference,
  prefersDark: boolean,
): 'light' | 'dark' {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return preference;
}
