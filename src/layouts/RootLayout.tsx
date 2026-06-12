import { useMemo, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { API_REGISTRY } from '@/apis/api-registry';
import { useAuth } from '@/features/auth/useAuth';
import { CommandPalette } from '@/features/search/CommandPalette';
import { SearchHotkeys } from '@/features/search/SearchHotkeys';
import { IncidentBanner } from '@/features/status/IncidentBanner';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { getDefaultApiId, portalSections } from '@/layouts/portal-navigation';
import { env } from '@/lib/env';
import { useCommandPaletteStore } from '@/store/command-palette-store';

function getNavLinkClass(isActive: boolean) {
  return [
    'block rounded-md px-3 py-2 text-sm font-medium',
    isActive
      ? 'bg-teal-50 text-accent dark:bg-teal-950 dark:text-teal-200'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' ');
}

type SidebarContentProps = {
  activeApiId: string;
  onNavigate?: () => void;
};

function SidebarContent({ activeApiId, onNavigate }: SidebarContentProps) {
  return (
    <div>
      <div className="text-lg font-semibold">Developer Portal</div>
      <div className="mt-7">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">APIs</p>
        <nav className="mt-2 space-y-1">
          {API_REGISTRY.map((api) => (
            <NavLink
              key={api.id}
              to={`/apis/${api.id}/documentation`}
              className={({ isActive }) => getNavLinkClass(isActive || activeApiId === api.id)}
              onClick={onNavigate}
            >
              <span className="block truncate">{api.name}</span>
              <span className="block text-xs font-normal text-slate-500">v{api.version}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-7">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sections
        </p>
        <nav className="mt-2 space-y-1">
          {portalSections.map((item) => (
            <NavLink
              key={item.segment}
              to={`/apis/${activeApiId}/${item.segment}`}
              className={({ isActive }) => getNavLinkClass(isActive)}
              onClick={onNavigate}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function RootLayout() {
  const { signOut, user } = useAuth();
  const { apiId } = useParams();
  const openCommandPalette = useCommandPaletteStore((state) => state.open);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const activeApiId = useMemo(
    () => (API_REGISTRY.some((api) => api.id === apiId) ? apiId : getDefaultApiId()),
    [apiId],
  );

  return (
    <div className="min-h-screen bg-canvas text-ink dark:bg-slate-950 dark:text-slate-100">
      <SearchHotkeys />
      <CommandPalette />
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <SidebarContent activeApiId={activeApiId} />
        <div className="absolute bottom-6 left-5 right-5 space-y-3">
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </aside>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-900/40"
            type="button"
            aria-label="Close navigation"
            onClick={() => {
              setIsDrawerOpen(false);
            }}
          />
          <aside className="absolute inset-y-0 left-0 w-80 max-w-[85vw] border-r border-slate-200 bg-white px-5 py-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="text-lg font-semibold">Developer Portal</span>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                Close
              </button>
            </div>
            <SidebarContent
              activeApiId={activeApiId}
              onNavigate={() => {
                setIsDrawerOpen(false);
              }}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <IncidentBanner />
          <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200 lg:hidden"
                type="button"
                onClick={() => {
                  setIsDrawerOpen(true);
                }}
              >
                Menu
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{env.VITE_APP_NAME}</p>
                <p className="truncate text-xs text-slate-500">{env.VITE_API_ENV} environment</p>
              </div>
            </div>
            <button
              className="hidden min-w-[16rem] items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 md:flex"
              type="button"
              onClick={() => {
                openCommandPalette();
              }}
            >
              <span>Search endpoints</span>
              <span className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs">Ctrl K</span>
            </button>
            <ThemeToggle />
            <div className="hidden min-w-0 text-right lg:block">
              <p className="truncate text-sm font-medium text-slate-700">{user?.email}</p>
              <p className="text-xs text-slate-500">{API_REGISTRY.length} registered APIs</p>
            </div>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
