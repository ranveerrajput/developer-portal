import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unconfigured';

export type AuthSession = Pick<Session, 'access_token' | 'user'>;
export type AuthUser = Pick<User, 'email'>;

export type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  user: AuthUser | null;
  error: string | null;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
