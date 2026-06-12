import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ApiKeyEnvironment } from '@/features/keys/key-utils';

export type ApiKeyRecord = {
  id: string;
  name: string;
  environment: ApiKeyEnvironment;
  maskedKey: string;
  createdAt: string;
  expiryDate: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type CreateKeyInput = {
  name: string;
  environment: ApiKeyEnvironment;
  maskedKey: string;
  expiryDate: string | null;
};

type ApiKeyState = {
  keys: ApiKeyRecord[];
  createKey: (input: CreateKeyInput) => ApiKeyRecord;
  revokeKey: (id: string) => void;
};

function createId() {
  return crypto.randomUUID();
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      keys: [],
      createKey: (input) => {
        const key: ApiKeyRecord = {
          id: createId(),
          name: input.name,
          environment: input.environment,
          maskedKey: input.maskedKey,
          createdAt: new Date().toISOString(),
          expiryDate: input.expiryDate,
          lastUsedAt: null,
          revokedAt: null,
        };

        set((state) => ({ keys: [key, ...state.keys] }));

        return key;
      },
      revokeKey: (id) => {
        set((state) => ({
          keys: state.keys.map((key) =>
            key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key,
          ),
        }));
      },
    }),
    {
      name: 'developer-portal-api-keys',
    },
  ),
);
