import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  AuthContext,
  type AuthContextValue,
  type AuthSession,
} from '@/features/auth/auth-context';
import { isSupabaseConfigured, supabase } from '@/features/auth/supabase-client';
import { env } from '@/lib/env';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unconfigured';

type AuthProviderProps = {
  children: ReactNode;
};

function authUnavailableError() {
  return new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const demoSessionKey = 'developer-portal-demo-session';
const isDemoMode = !isSupabaseConfigured && env.VITE_ENABLE_DEMO_AUTH;

function createDemoSession(email: string): AuthSession {
  return {
    access_token: '',
    user: { email } as Session['user'],
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    if (!isDemoMode) {
      return null;
    }

    const email = localStorage.getItem(demoSessionKey);
    return email ? createDemoSession(email) : null;
  });
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (isSupabaseConfigured) {
      return 'loading';
    }

    if (isDemoMode) {
      return localStorage.getItem(demoSessionKey) ? 'authenticated' : 'unauthenticated';
    }

    return 'unconfigured';
  });
  const [error, setError] = useState<string | null>(
    isSupabaseConfigured || isDemoMode ? null : authUnavailableError().message,
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setStatus('unauthenticated');
        return;
      }

      setSession(data.session);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      localStorage.setItem(demoSessionKey, email);
      setSession(createDemoSession(email));
      setStatus('authenticated');
      return;
    }

    if (!supabase) {
      throw authUnavailableError();
    }

    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      localStorage.setItem(demoSessionKey, email);
      setSession(createDemoSession(email));
      setStatus('authenticated');
      return;
    }

    if (!supabase) {
      throw authUnavailableError();
    }

    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem(demoSessionKey);
      setSession(null);
      setStatus('unauthenticated');
      return;
    }

    if (!supabase) {
      throw authUnavailableError();
    }

    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      throw signOutError;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      error,
      isDemoMode,
      signIn,
      signUp,
      signOut,
    }),
    [error, session, signIn, signOut, signUp, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
