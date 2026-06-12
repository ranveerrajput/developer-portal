import type { ApiDefinition } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';

type SdkResourcesProps = {
  api: ApiDefinition;
};

export function SdkResources({ api }: SdkResourcesProps) {
  if (!api.sdks || api.sdks.length === 0) {
    return (
      <EmptyState
        title="No SDK resources"
        description="This API does not have SDK links registered."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {api.sdks.map((sdk) => (
        <article key={`${sdk.lang}-${sdk.repo}`} className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-ink">{sdk.lang}</h3>
            <a
              className="text-sm font-medium text-accent hover:underline"
              href={sdk.repo}
              rel="noreferrer"
              target="_blank"
            >
              Repository
            </a>
          </div>
          {sdk.install ? (
            <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
              <code>{sdk.install}</code>
            </pre>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No install command registered.</p>
          )}
        </article>
      ))}
    </div>
  );
}
