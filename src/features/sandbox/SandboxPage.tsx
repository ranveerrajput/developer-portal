import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo, useState } from 'react';

import type { ApiDefinition } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuth } from '@/features/auth/useAuth';
import {
  buildInitialValues,
  buildSandboxRequest,
  executeSandboxRequest,
  generateSandboxSnippets,
  getParametersByLocation,
  injectAuthToken,
  type BuiltSandboxRequest,
  type SandboxSnippet,
  type SandboxExecutionResult,
  type SandboxFieldValues,
} from '@/features/sandbox/sandbox-utils';
import { parseOpenApiSpec, type EndpointDef } from '@/lib/spec-parser';

type SandboxPageProps = {
  api: ApiDefinition;
};

type FieldGroupProps = {
  title: string;
  values: SandboxFieldValues;
  onChange: (name: string, value: string) => void;
  emptyText: string;
};

function FieldGroup({ title, values, onChange, emptyText }: FieldGroupProps) {
  const entries = Object.entries(values);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {entries.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {entries.map(([name, value]) => (
            <label key={name} className="block">
              <span className="text-sm font-medium text-slate-700">{name}</span>
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
                value={value}
                onChange={(event) => {
                  onChange(name, event.target.value);
                }}
              />
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

function createHeaderValues(): SandboxFieldValues {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function buildDefaultBody(endpoint: EndpointDef) {
  return endpoint.requestBody ? '{\n  \n}' : '';
}

function getStatusBadgeClass(status: number) {
  if (status >= 200 && status < 300) {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (status >= 300 && status < 400) {
    return 'bg-sky-100 text-sky-800';
  }

  if (status >= 400 && status < 500) {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-red-100 text-red-800';
}

function ResponsePanel({
  error,
  isLoading,
  result,
}: {
  error: string | null;
  isLoading: boolean;
  result: SandboxExecutionResult | null;
}) {
  if (isLoading) {
    return <LoadingState label="Sending sandbox request" />;
  }

  if (error) {
    return <ErrorState title="Request failed" description={error} />;
  }

  if (!result) {
    return (
      <EmptyState
        title="No response yet"
        description="Send a request to see the live response, status, and latency."
      />
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded px-2 py-1 text-xs font-bold ${getStatusBadgeClass(result.status)}`}
        >
          {result.status}
        </span>
        <span className="text-sm text-slate-600">{result.latencyMs} ms</span>
      </div>
      <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        <code>{JSON.stringify(result.data, null, 2)}</code>
      </pre>
    </div>
  );
}

function SnippetPanel({ request }: { request: BuiltSandboxRequest }) {
  const [copiedSnippetId, setCopiedSnippetId] = useState<SandboxSnippet['id'] | null>(null);
  const snippets = useMemo(() => generateSandboxSnippets(request), [request]);

  async function copySnippet(snippet: SandboxSnippet) {
    await navigator.clipboard.writeText(snippet.code);
    setCopiedSnippetId(snippet.id);
    window.setTimeout(() => {
      setCopiedSnippetId(null);
    }, 1500);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Code Snippets
      </h2>
      <div className="grid gap-4 xl:grid-cols-3">
        {snippets.map((snippet) => (
          <article
            key={snippet.id}
            className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">{snippet.label}</h3>
              <button
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                type="button"
                onClick={() => {
                  void copySnippet(snippet);
                }}
              >
                {copiedSnippetId === snippet.id ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="max-h-80 overflow-auto bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code>{snippet.code}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SandboxPage({ api }: SandboxPageProps) {
  const { session } = useAuth();
  const endpoints = useMemo(() => parseOpenApiSpec(api.spec), [api.spec]);
  const initialEndpoint = endpoints.at(0);
  const [selectedEndpointId, setSelectedEndpointId] = useState(initialEndpoint?.id ?? '');
  const selectedEndpoint = endpoints.find((endpoint) => endpoint.id === selectedEndpointId);
  const [pathParams, setPathParams] = useState<SandboxFieldValues>(
    initialEndpoint ? buildInitialValues(getParametersByLocation(initialEndpoint, 'path')) : {},
  );
  const [queryParams, setQueryParams] = useState<SandboxFieldValues>(
    initialEndpoint ? buildInitialValues(getParametersByLocation(initialEndpoint, 'query')) : {},
  );
  const [headers, setHeaders] = useState<SandboxFieldValues>(createHeaderValues);
  const [body, setBody] = useState(initialEndpoint ? buildDefaultBody(initialEndpoint) : '');
  const [responseResult, setResponseResult] = useState<SandboxExecutionResult | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  function resetEndpoint(endpoint: EndpointDef) {
    setSelectedEndpointId(endpoint.id);
    setPathParams(buildInitialValues(getParametersByLocation(endpoint, 'path')));
    setQueryParams(buildInitialValues(getParametersByLocation(endpoint, 'query')));
    setHeaders(createHeaderValues());
    setBody(buildDefaultBody(endpoint));
    setResponseResult(null);
    setResponseError(null);
  }

  if (endpoints.length === 0 || !initialEndpoint) {
    return (
      <EmptyState
        title="No sandbox endpoints"
        description="This API spec does not define endpoints that can be used in the sandbox."
      />
    );
  }

  const endpoint = selectedEndpoint ?? initialEndpoint;
  const preview = buildSandboxRequest(api, endpoint, pathParams, queryParams, headers, body);
  const executablePreview = injectAuthToken(preview, session?.access_token);

  async function handleSendRequest() {
    setIsSending(true);
    setResponseError(null);

    try {
      const result = await executeSandboxRequest(executablePreview);
      setResponseResult(result);
    } catch (error) {
      setResponseResult(null);
      setResponseError(error instanceof Error ? error.message : 'Unable to execute request.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{api.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Sandbox</h1>
        <p className="mt-2 text-sm text-slate-600">
          Build and execute real requests from the OpenAPI specification.
        </p>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Endpoint</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
            value={endpoint.id}
            onChange={(event) => {
              const nextEndpoint = endpoints.find((item) => item.id === event.target.value);
              if (nextEndpoint) {
                resetEndpoint(nextEndpoint);
              }
            }}
          >
            {endpoints.map((item) => (
              <option key={item.id} value={item.id}>
                {item.method.toUpperCase()} {item.path}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold uppercase text-white">
              {preview.method}
            </span>
            <span className="break-all font-mono text-sm text-slate-700">{preview.url}</span>
          </div>
          <button
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isSending}
            onClick={() => {
              void handleSendRequest();
            }}
          >
            {isSending ? 'Sending...' : 'Send request'}
          </button>
        </div>
        {session?.access_token ? (
          <p className="mt-3 text-xs text-slate-500">Auth token will be injected automatically.</p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Sign in to inject an auth token automatically.
          </p>
        )}
      </div>

      <SnippetPanel request={executablePreview} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Response</h2>
        <ResponsePanel error={responseError} isLoading={isSending} result={responseResult} />
      </section>

      <div className="space-y-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <FieldGroup
          title="Path Params"
          values={pathParams}
          onChange={(name, value) => {
            setPathParams((current) => ({ ...current, [name]: value }));
          }}
          emptyText="No path params"
        />
        <FieldGroup
          title="Query Params"
          values={queryParams}
          onChange={(name, value) => {
            setQueryParams((current) => ({ ...current, [name]: value }));
          }}
          emptyText="No query params"
        />
        <FieldGroup
          title="Headers"
          values={headers}
          onChange={(name, value) => {
            setHeaders((current) => ({ ...current, [name]: value }));
          }}
          emptyText="No headers"
        />
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            JSON Body
          </h2>
          {endpoint.requestBody ? (
            <div className="overflow-hidden rounded-md border border-slate-300">
              <CodeMirror
                value={body}
                height="220px"
                extensions={[json()]}
                onChange={(value) => {
                  setBody(value);
                }}
              />
            </div>
          ) : (
            <EmptyState title="No JSON body" description="This endpoint does not accept a body." />
          )}
        </section>
      </div>
    </section>
  );
}
