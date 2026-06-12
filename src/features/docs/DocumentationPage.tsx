import { useQuery } from '@tanstack/react-query';

import type { ApiDefinition } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { MarkdownQuickstart } from '@/features/docs/MarkdownQuickstart';
import { SdkResources } from '@/features/docs/SdkResources';
import { ErrorCatalogue } from '@/features/errors/ErrorCatalogue';
import { parseOpenApiSpec, type EndpointDef, type HttpMethod } from '@/lib/spec-parser';

type DocumentationPageProps = {
  api: ApiDefinition;
};

const methodStyles = {
  get: 'bg-emerald-100 text-emerald-800',
  post: 'bg-sky-100 text-sky-800',
  put: 'bg-amber-100 text-amber-800',
  patch: 'bg-purple-100 text-purple-800',
  delete: 'bg-red-100 text-red-800',
  options: 'bg-slate-100 text-slate-700',
  head: 'bg-slate-100 text-slate-700',
  trace: 'bg-slate-100 text-slate-700',
} satisfies Record<HttpMethod, string>;

function loadEndpoints(api: ApiDefinition) {
  return Promise.resolve(parseOpenApiSpec(api.spec));
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={`inline-flex min-w-16 justify-center rounded px-2 py-1 text-xs font-bold uppercase ${methodStyles[method]}`}
    >
      {method}
    </span>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getSchemaLabel(schema: unknown): string {
  if (!isRecord(schema)) {
    return 'unknown';
  }

  if (typeof schema.$ref === 'string') {
    return schema.$ref;
  }

  if (typeof schema.type === 'string') {
    return typeof schema.format === 'string' ? `${schema.type} (${schema.format})` : schema.type;
  }

  return 'object';
}

function SchemaBlock({ schema }: { schema?: unknown }) {
  if (!schema) {
    return <p className="text-sm text-slate-500">No schema provided.</p>;
  }

  return (
    <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      <code>{JSON.stringify(schema, null, 2)}</code>
    </pre>
  );
}

function ParametersTable({ endpoint }: { endpoint: EndpointDef }) {
  if (endpoint.parameters.length === 0) {
    return <EmptyState title="No parameters" description="This endpoint does not define parameters." />;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">In</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Required</th>
            <th className="px-4 py-3">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {endpoint.parameters.map((parameter) => (
            <tr key={`${parameter.in}-${parameter.name}`}>
              <td className="px-4 py-3 font-medium text-ink">{parameter.name}</td>
              <td className="px-4 py-3 text-slate-600">{parameter.in}</td>
              <td className="px-4 py-3 text-slate-600">{getSchemaLabel(parameter.schema)}</td>
              <td className="px-4 py-3 text-slate-600">{parameter.required ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3 text-slate-600">
                {parameter.description ?? 'No description.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestBodySection({ endpoint }: { endpoint: EndpointDef }) {
  if (!endpoint.requestBody) {
    return <EmptyState title="No request body" description="This endpoint does not accept a body." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span>{endpoint.requestBody.required ? 'Required' : 'Optional'}</span>
        {endpoint.requestBody.contentTypes.map((contentType) => (
          <span key={contentType} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
            {contentType}
          </span>
        ))}
      </div>
      {endpoint.requestBody.description ? (
        <p className="text-sm text-slate-600">{endpoint.requestBody.description}</p>
      ) : null}
      <SchemaBlock schema={endpoint.requestBody.schema} />
    </div>
  );
}

function ResponsesSection({ endpoint }: { endpoint: EndpointDef }) {
  if (endpoint.responses.length === 0) {
    return <EmptyState title="No responses" description="This endpoint does not define responses." />;
  }

  return (
    <div className="space-y-4">
      {endpoint.responses.map((response) => (
        <div key={response.statusCode} className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white">
              {response.statusCode}
            </span>
            <p className="text-sm text-slate-700">{response.description || 'No description.'}</p>
          </div>
          {response.contentTypes.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {response.contentTypes.map((contentType) => (
                <span
                  key={contentType}
                  className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
                >
                  {contentType}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-3">
            <SchemaBlock schema={response.schema} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EndpointDocumentation({ endpoint }: { endpoint: EndpointDef }) {
  return (
    <article id={endpoint.id} className="scroll-mt-24 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <h2 className="break-all font-mono text-lg font-semibold text-ink">{endpoint.path}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {endpoint.description ?? endpoint.summary ?? 'No description provided.'}
      </p>

      <div className="mt-6 space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Parameters</h3>
          <ParametersTable endpoint={endpoint} />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Request Body
          </h3>
          <RequestBodySection endpoint={endpoint} />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Responses</h3>
          <ResponsesSection endpoint={endpoint} />
        </section>
      </div>
    </article>
  );
}

export function DocumentationPage({ api }: DocumentationPageProps) {
  const {
    data: endpoints,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['api-documentation', api.id, api.version],
    queryFn: () => loadEndpoints(api),
  });

  if (isLoading) {
    return <LoadingState label={`Loading ${api.name} documentation`} />;
  }

  if (isError) {
    return <ErrorState title="Unable to load documentation" />;
  }

  if (!endpoints || endpoints.length === 0) {
    return (
      <EmptyState
        title="No endpoints found"
        description="This API spec does not define any OpenAPI paths."
      />
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{api.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Documentation</h1>
        <p className="mt-2 text-sm text-slate-600">
          Rendered dynamically from the registered OpenAPI specification.
        </p>
      </div>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Getting Started
        </h2>
        <MarkdownQuickstart api={api} />
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          SDK Resources
        </h2>
        <SdkResources api={api} />
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Error Catalogue
        </h2>
        <ErrorCatalogue api={api} />
      </section>
      <div className="space-y-5">
        {endpoints.map((endpoint) => (
          <EndpointDocumentation key={endpoint.id} endpoint={endpoint} />
        ))}
      </div>
    </section>
  );
}
