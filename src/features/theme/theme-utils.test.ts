import { resolveThemePreference } from '@/features/theme/theme-utils';

describe('resolveThemePreference', () => {
  it('uses system preference when theme is system', () => {
    expect(resolveThemePreference('system', true)).toBe('dark');
    expect(resolveThemePreference('system', false)).toBe('light');
  });

  it('uses explicit theme preferences', () => {
    expect(resolveThemePreference('dark', false)).toBe('dark');
    expect(resolveThemePreference('light', true)).toBe('light');
  });
});
