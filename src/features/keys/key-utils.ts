export type ApiKeyEnvironment = 'sandbox' | 'staging' | 'production';

const KEY_PREFIX = 'dp';

export function generateApiKey(environment: ApiKeyEnvironment): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${KEY_PREFIX}_${environment}_${token}`;
}

export function maskApiKey(key: string): string {
  const suffix = key.slice(-4);

  return `•••• •••• •••• ${suffix}`;
}

export function formatDate(value: string | null): string {
  if (!value) {
    return 'No expiry';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}
