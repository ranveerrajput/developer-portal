import type { ThemePreference } from '@/store/ui-store';
import { useUiStore } from '@/store/ui-store';

const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] satisfies Array<{ label: string; value: ThemePreference }>;

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <label className="hidden items-center gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex">
      <span className="sr-only">Theme</span>
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-accent focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        value={theme}
        onChange={(event) => {
          setTheme(event.target.value as ThemePreference);
        }}
        aria-label="Theme preference"
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
