import { useQuery } from '@tanstack/react-query';

import type { ApiDefinition } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { buildMockUsageAnalytics, type AnalyticsPoint } from '@/features/analytics/analytics-data';

type AnalyticsPageProps = {
  api: ApiDefinition;
};

function loadAnalytics(api: ApiDefinition) {
  return Promise.resolve(buildMockUsageAnalytics(api));
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMs(value: number) {
  return `${value.toString()} ms`;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function BarChart({ series }: { series: AnalyticsPoint[] }) {
  const maxCalls = Math.max(...series.map((point) => point.calls), 1);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Call Volume</h2>
      <div className="mt-5 flex h-52 gap-3">
        {series.map((point) => (
          <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex min-h-0 w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-accent"
                style={{ height: `${Math.max((point.calls / maxCalls) * 100, 6).toString()}%` }}
                title={`${point.calls.toString()} calls`}
                role="img"
                aria-label={`${point.date}: ${point.calls.toString()} calls`}
              />
            </div>
            <span className="mt-2 text-xs font-medium text-slate-700">
              {point.calls.toLocaleString()}
            </span>
            <span className="mt-1 truncate text-xs text-slate-500">{point.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatencyChart({ series }: { series: AnalyticsPoint[] }) {
  const maxLatency = Math.max(...series.map((point) => point.latencyMs), 1);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Latency</h2>
      <div className="mt-5 space-y-3">
        {series.map((point) => (
          <div key={point.date} className="grid grid-cols-[4.5rem_1fr_4rem] items-center gap-3">
            <span className="text-xs text-slate-500">{point.date.slice(5)}</span>
            <div className="h-3 rounded bg-slate-100">
              <div
                className="h-3 rounded bg-sky-500"
                style={{
                  width: `${Math.max((point.latencyMs / maxLatency) * 100, 8).toString()}%`,
                }}
              />
            </div>
            <span className="text-right text-xs font-medium text-slate-600">
              {formatMs(point.latencyMs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPage({ api }: AnalyticsPageProps) {
  const {
    data: analytics,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['api-analytics', api.id, api.version],
    queryFn: () => loadAnalytics(api),
  });

  if (isLoading) {
    return <LoadingState label={`Loading ${api.name} analytics`} />;
  }

  if (isError) {
    return <ErrorState title="Unable to load analytics" />;
  }

  if (!analytics || analytics.endpoints.length === 0) {
    return (
      <EmptyState
        title="No analytics available"
        description="This API does not have endpoints to build usage analytics."
      />
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{api.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Mock usage metrics generated from registered OpenAPI endpoints.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Call Volume" value={analytics.totalCalls.toLocaleString()} />
        <MetricCard label="Error Rate" value={formatPercent(analytics.errorRate)} />
        <MetricCard label="Avg Latency" value={formatMs(analytics.averageLatencyMs)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChart series={analytics.series} />
        <LatencyChart series={analytics.series} />
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Calls</th>
              <th className="px-4 py-3">Error Rate</th>
              <th className="px-4 py-3">Avg Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {analytics.endpoints.map((endpoint) => (
              <tr key={endpoint.endpointId}>
                <td className="px-4 py-3 font-mono text-slate-700">{endpoint.path}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{endpoint.calls.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">{formatPercent(endpoint.errorRate)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatMs(endpoint.averageLatencyMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
