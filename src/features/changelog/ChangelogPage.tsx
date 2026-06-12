import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { API_REGISTRY } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import {
  buildChangelogItems,
  filterChangelogItems,
  type ChangelogApiFilter,
  type ChangelogTypeFilter,
} from '@/features/changelog/changelog-utils';

const typeFilters = ['all', 'breaking', 'feature', 'fix'] satisfies ChangelogTypeFilter[];

function loadChangelog() {
  return Promise.resolve(buildChangelogItems(API_REGISTRY));
}

function typeBadgeClass(type: Exclude<ChangelogTypeFilter, 'all'>) {
  if (type === 'breaking') {
    return 'bg-red-100 text-red-800';
  }

  if (type === 'feature') {
    return 'bg-sky-100 text-sky-800';
  }

  return 'bg-emerald-100 text-emerald-800';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function ChangelogPage() {
  const [apiFilter, setApiFilter] = useState<ChangelogApiFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ChangelogTypeFilter>('all');
  const {
    data: items,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['api-changelog'],
    queryFn: loadChangelog,
  });
  const filteredItems = useMemo(
    () => filterChangelogItems(items ?? [], apiFilter, typeFilter),
    [apiFilter, items, typeFilter],
  );

  if (isLoading) {
    return <LoadingState label="Loading changelog" />;
  }

  if (isError) {
    return <ErrorState title="Unable to load changelog" />;
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No changelog entries"
        description="Registered APIs do not include changelog data."
      />
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          {items.length.toString()} entries
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Changelog</h1>
        <p className="mt-2 text-sm text-slate-600">
          Versioned entries loaded from each registered API changelog JSON file.
        </p>
      </div>

      <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">API</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
            value={apiFilter}
            onChange={(event) => {
              setApiFilter(event.target.value);
            }}
          >
            <option value="all">All APIs</option>
            {API_REGISTRY.map((api) => (
              <option key={api.id} value={api.id}>
                {api.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as ChangelogTypeFilter);
            }}
          >
            {typeFilters.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState title="No matching entries" description="Adjust the filters and try again." />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <article
              key={`${item.apiId}-${item.version}-${item.title}`}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.apiName} · v{item.version} · {formatDate(item.date)}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{item.title}</h2>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold capitalize ${typeBadgeClass(
                    item.type,
                  )}`}
                >
                  {item.type}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
