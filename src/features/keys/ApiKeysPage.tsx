import { useMemo, useState, type FormEvent } from 'react';
import { z } from 'zod';

import { EmptyState } from '@/components/feedback/EmptyState';
import { useApiKeyStore, type ApiKeyRecord } from '@/features/keys/api-key-store';
import {
  formatDate,
  generateApiKey,
  maskApiKey,
  type ApiKeyEnvironment,
} from '@/features/keys/key-utils';

const createKeySchema = z.object({
  name: z.string().trim().min(2, 'Enter a key name.'),
  environment: z.enum(['sandbox', 'staging', 'production']),
  expiryDate: z.string().optional(),
});

type CreateKeyFormValues = z.infer<typeof createKeySchema>;

const environments = ['sandbox', 'staging', 'production'] satisfies ApiKeyEnvironment[];

function environmentBadgeClass(environment: ApiKeyEnvironment) {
  if (environment === 'production') {
    return 'bg-red-100 text-red-800';
  }

  if (environment === 'staging') {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-emerald-100 text-emerald-800';
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function ApiKeyTable({ keys, onRevoke }: { keys: ApiKeyRecord[]; onRevoke: (id: string) => void }) {
  const activeKeys = keys.filter((key) => !key.revokedAt);

  if (activeKeys.length === 0) {
    return (
      <EmptyState
        title="No active API keys"
        description="Create a key to start making authenticated sandbox requests."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Key</th>
            <th className="px-4 py-3">Environment</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Expiry</th>
            <th className="px-4 py-3">Last Used</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {activeKeys.map((key) => (
            <tr key={key.id}>
              <td className="px-4 py-3 font-medium text-ink">{key.name}</td>
              <td className="px-4 py-3 font-mono text-slate-600">{key.maskedKey}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${environmentBadgeClass(
                    key.environment,
                  )}`}
                >
                  {key.environment}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatTimestamp(key.createdAt)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(key.expiryDate)}</td>
              <td className="px-4 py-3 text-slate-600">{formatTimestamp(key.lastUsedAt)}</td>
              <td className="px-4 py-3">
                <button
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Revoke ${key.name}? This cannot be undone.`)) {
                      onRevoke(key.id);
                    }
                  }}
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApiKeysPage() {
  const keys = useApiKeyStore((state) => state.keys);
  const createKey = useApiKeyStore((state) => state.createKey);
  const revokeKey = useApiKeyStore((state) => state.revokeKey);
  const [values, setValues] = useState<CreateKeyFormValues>({
    name: '',
    environment: 'sandbox',
    expiryDate: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const activeKeyCount = useMemo(() => keys.filter((key) => !key.revokedAt).length, [keys]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setCreatedSecret(null);

    const parsed = createKeySchema.safeParse(values);

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check the key details.');
      return;
    }

    const secret = generateApiKey(parsed.data.environment);
    createKey({
      name: parsed.data.name,
      environment: parsed.data.environment,
      maskedKey: maskApiKey(secret),
      expiryDate: parsed.data.expiryDate || null,
    });
    setCreatedSecret(secret);
    setCopied(false);
    setValues({ name: '', environment: parsed.data.environment, expiryDate: '' });
  }

  async function copyCreatedSecret() {
    if (!createdSecret) {
      return;
    }

    await navigator.clipboard.writeText(createdSecret);
    setCopied(true);
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          {activeKeyCount} active keys
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">API Keys</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create environment-specific API keys, copy them once, and revoke them when no longer
          needed.
        </p>
      </div>

      {createdSecret ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Copy this key now</h2>
              <p className="mt-1 text-sm">
                This is the only time the full API key will be shown. Store it securely.
              </p>
            </div>
            <button
              className="rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium"
              type="button"
              onClick={() => {
                void copyCreatedSecret();
              }}
            >
              {copied ? 'Copied' : 'Copy key'}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
            <code>{createdSecret}</code>
          </pre>
        </div>
      ) : null}

      <form
        className="space-y-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Key name</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
              value={values.name}
              onChange={(event) => {
                setValues((current) => ({ ...current, name: event.target.value }));
              }}
              placeholder="Partner sandbox key"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Environment</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
              value={values.environment}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  environment: event.target.value as ApiKeyEnvironment,
                }));
              }}
            >
              {environments.map((environment) => (
                <option key={environment} value={environment}>
                  {environment}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Expiry date</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
              type="date"
              value={values.expiryDate}
              onChange={(event) => {
                setValues((current) => ({ ...current, expiryDate: event.target.value }));
              }}
            />
          </label>
        </div>
        {formError ? (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {formError}
          </div>
        ) : null}
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" type="submit">
          Create key
        </button>
      </form>

      <ApiKeyTable keys={keys} onRevoke={revokeKey} />
    </section>
  );
}
