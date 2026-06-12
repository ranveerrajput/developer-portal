import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { ApiDefinition } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { filterErrorCatalogue } from '@/features/errors/error-filter';

type ErrorCatalogueProps = {
  api: ApiDefinition;
};

function loadErrorCatalogue(api: ApiDefinition) {
  return Promise.resolve(api.errors ?? []);
}

export function ErrorCatalogue({ api }: ErrorCatalogueProps) {
  const [query, setQuery] = useState('');
  const {
    data: errors,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['api-error-catalogue', api.id, api.version],
    queryFn: () => loadErrorCatalogue(api),
  });

  if (isLoading) {
    return <LoadingState label={`Loading ${api.name} error catalogue`} />;
  }

  if (isError) {
    return <ErrorState title="Unable to load error catalogue" />;
  }

  if (!errors || errors.length === 0) {
    return (
      <EmptyState
        title="No errors documented"
        description="This API does not have error catalogue entries registered."
      />
    );
  }

  const filteredErrors = filterErrorCatalogue(errors, query);

  return (
    <div className="space-y-4">
      <label className="block max-w-xl">
        <span className="text-sm font-medium text-slate-700">Filter errors</span>
        <input
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder="Search by code, description, cause, or resolution"
        />
      </label>

      {filteredErrors.length === 0 ? (
        <EmptyState title="No matching errors" description="Adjust the filter and try again." />
      ) : (
        <div className="grid gap-3">
          {filteredErrors.map((entry) => (
            <article key={entry.code} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded bg-red-100 px-2 py-1 font-mono text-xs font-bold text-red-800">
                  {entry.code}
                </span>
                <h3 className="text-base font-semibold text-ink">{entry.description}</h3>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Causes
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {entry.causes.map((cause) => (
                      <li key={cause}>{cause}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Resolution
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{entry.resolution}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
