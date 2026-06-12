import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_REGISTRY } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { buildEndpointSearchIndex, searchEndpoints } from '@/features/search/search-index';
import { useCommandPaletteStore } from '@/store/command-palette-store';

function getResultDescription(item: ReturnType<typeof buildEndpointSearchIndex>[number]) {
  return item.endpoint.description ?? item.endpoint.summary ?? 'No description provided.';
}

export function CommandPalette() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = useCommandPaletteStore((state) => state.isOpen);
  const close = useCommandPaletteStore((state) => state.close);
  const [query, setQuery] = useState('');
  const searchIndex = useMemo(() => buildEndpointSearchIndex(API_REGISTRY), []);
  const results = useMemo(() => searchEndpoints(searchIndex, query).slice(0, 8), [query, searchIndex]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setQuery('');
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-slate-950/40"
        type="button"
        aria-label="Close search"
        onClick={() => {
          close();
        }}
      />
      <div
        className="absolute left-1/2 top-16 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Search endpoints"
      >
        <div className="border-b border-slate-200 p-4">
          <input
            ref={inputRef}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search endpoints, descriptions, or parameters"
            type="search"
          />
        </div>
        <div className="max-h-[28rem] overflow-y-auto p-2">
          {results.length === 0 ? (
            <EmptyState
              title="No endpoints found"
              description="Try searching for an endpoint path, description, or parameter."
            />
          ) : (
            <ul className="space-y-1">
              {results.map((item) => (
                <li key={`${item.apiId}-${item.endpoint.id}`}>
                  <button
                    className="w-full rounded-md px-3 py-3 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                    type="button"
                    onClick={() => {
                      navigate(`/apis/${item.apiId}/documentation#${item.endpoint.id}`);
                      close();
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold uppercase text-white">
                        {item.endpoint.method}
                      </span>
                      <span className="break-all font-mono text-sm font-semibold text-ink">
                        {item.endpoint.path}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {getResultDescription(item)}
                    </p>
                    <p className="mt-2 text-xs font-medium text-accent">{item.apiName}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
