import { isoDate, uid } from "../../lib/format";

const KEY_STORAGE = "dev_portal_api_keys";

export type KeyEnvironment = "sandbox" | "production";

export interface ApiKeyRecord {
  id: string;
  name: string;
  environment: KeyEnvironment;
  createdAt: string;
  lastUsed: string;
  expiresAt?: string;
  secret: string;
  revoked: boolean;
}

function readKeys(): ApiKeyRecord[] {
  const raw = localStorage.getItem(KEY_STORAGE);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ApiKeyRecord[];
  } catch {
    return [];
  }
}

function writeKeys(keys: ApiKeyRecord[]): void {
  localStorage.setItem(KEY_STORAGE, JSON.stringify(keys));
}

export function listKeys(): ApiKeyRecord[] {
  return readKeys().filter((key) => !key.revoked);
}

export function createKey(name: string, environment: KeyEnvironment, expiresAt?: string): ApiKeyRecord {
  const record: ApiKeyRecord = {
    id: uid("key"),
    name,
    environment,
    createdAt: isoDate(),
    lastUsed: "Never",
    expiresAt,
    secret: `sk_${environment}_${crypto.getRandomValues(new Uint32Array(4)).join("")}`,
    revoked: false,
  };
  writeKeys([record, ...readKeys()]);
  return record;
}

export function revokeKey(id: string): void {
  writeKeys(readKeys().map((key) => (key.id === id ? { ...key, revoked: true } : key)));
}
