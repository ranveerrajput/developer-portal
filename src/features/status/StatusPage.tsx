import { useQuery } from '@tanstack/react-query';

import { API_REGISTRY } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { buildMockStatusData, type ApiHealthState } from '@/features/status/status-data';

function loadStatuses() {
  return Promise.resolve(buildMockStatusData(API_REGISTRY));
}

function stateBadgeClass(state: ApiHealthState) {
  if (state === 'operational') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (state === 'degraded') {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-red-100 text-red-800';
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function StatusPage() {
  const {
    data: statuses,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['api-status'],
    queryFn: loadStatuses,
  });

  if (isLoading) {
    return <LoadingState label="Loading API status" />;
  }

  if (isError) {
    return <ErrorState title="Unable to load API status" />;
  }

  if (!statuses || statuses.length === 0) {
    return <EmptyState title="No APIs registered" description="Status appears when APIs exist." />;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          90-day service health
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Status</h1>
        <p className="mt-2 text-sm text-slate-600">
          Mock operational status and incident history for registered APIs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {statuses.map((status) => (
          <article key={status.apiId} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{status.apiName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {status.uptimePercent.toFixed(2)}% uptime
                </p>
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-semibold capitalize ${stateBadgeClass(
                  status.state,
                )}`}
              >
                {status.state}
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Incident History
        </h2>
        <div className="space-y-3">
          {statuses.flatMap((status) =>
            status.incidents.map((incident) => (
              <article
                key={incident.id}
                className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {status.apiName}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-ink">{incident.title}</h3>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold capitalize ${stateBadgeClass(
                      incident.state,
                    )}`}
                  >
                    {incident.resolvedAt ? 'resolved' : incident.state}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-700">Started</dt>
                    <dd className="mt-1 text-slate-600">{formatTimestamp(incident.startedAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Resolved</dt>
                    <dd className="mt-1 text-slate-600">
                      {incident.resolvedAt ? formatTimestamp(incident.resolvedAt) : 'In progress'}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-6 text-slate-600">{incident.resolutionNotes}</p>
              </article>
            )),
          )}
        </div>
      </section>
    </section>
  );
}
