import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { Session } from "./auth-service";
import { getStoredSession, refreshSession, signIn, signOut, signUp } from "./auth-service";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getStoredSession());

  const login = useCallback(async (email: string, password: string) => {
    setSession(await signIn(email, password));
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setSession(await signUp(email, password, name));
  }, []);

  const logout = useCallback(() => {
    signOut();
    setSession(null);
  }, []);

  const getToken = useCallback(() => {
    if (!session) return undefined;
    if (session.expiresAt - Date.now() < 60_000) {
      const refreshed = refreshSession(session);
      setSession(refreshed);
      return refreshed.token;
    }
    return session.token;
  }, [session]);

  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session), login, register, logout, getToken }),
    [getToken, login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
