import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ApiDefinition } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';

type MarkdownQuickstartProps = {
  api: ApiDefinition;
};

async function loadMarkdown(api: ApiDefinition) {
  if (!api.docsFile) {
    return '';
  }

  const response = await fetch(api.docsFile);

  if (!response.ok) {
    throw new Error(`Unable to load ${api.docsFile}.`);
  }

  return response.text();
}

export function MarkdownQuickstart({ api }: MarkdownQuickstartProps) {
  const {
    data: markdown,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['api-quickstart', api.id, api.docsFile],
    queryFn: () => loadMarkdown(api),
  });

  if (isLoading) {
    return <LoadingState label={`Loading ${api.name} quickstart`} />;
  }

  if (isError) {
    return <ErrorState title="Unable to load quickstart" />;
  }

  if (!markdown?.trim()) {
    return (
      <EmptyState
        title="No quickstart available"
        description="This API does not have a docs.md file registered."
      />
    );
  }

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-2xl font-semibold text-ink">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="mt-6 text-lg font-semibold text-ink">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-5 text-base font-semibold text-ink">{children}</h4>
          ),
          p: ({ children }) => <p className="mt-3 text-sm leading-6 text-slate-600">{children}</p>,
          a: ({ children, href }) => (
            <a
              className="font-medium text-accent hover:underline"
              href={href}
              rel="noreferrer"
              target={href?.startsWith('http') ? '_blank' : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-900">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-slate-200">{children}</tbody>,
          th: ({ children }) => <th className="px-4 py-3">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 text-slate-600">{children}</td>,
          ul: ({ children }) => (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">{children}</ol>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
