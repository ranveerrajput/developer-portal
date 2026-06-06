import { uid } from "../../lib/format";

const USERS_KEY = "dev_portal_users";
const SESSION_KEY = "dev_portal_session";
const TOKEN_TTL_MS = 20 * 60 * 1000;

export interface User {
  id: string;
  email: string;
  name: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

export interface Session {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createToken(user: User, expiresAt: number): string {
  const payload = btoa(JSON.stringify({ sub: user.id, email: user.email, iss: import.meta.env.VITE_AUTH_TOKEN_ISSUER, exp: expiresAt }));
  return `local.${payload}.${uid("sig")}`;
}

function createSession(user: User): Session {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  return { user, expiresAt, token: createToken(user, expiresAt), refreshToken: uid("refresh") };
}

export async function signUp(email: string, password: string, name: string): Promise<Session> {
  const users = readJson<StoredUser[]>(USERS_KEY, []);
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account already exists for this email.");
  }
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const user: StoredUser = { id: uid("usr"), email, name, passwordHash: await hashPassword(password) };
  writeJson(USERS_KEY, [...users, user]);
  const session = createSession(user);
  writeJson(SESSION_KEY, session);
  return session;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const users = readJson<StoredUser[]>(USERS_KEY, []);
  const passwordHash = await hashPassword(password);
  const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.passwordHash === passwordHash);
  if (!user) throw new Error("Invalid email or password.");
  const session = createSession(user);
  writeJson(SESSION_KEY, session);
  return session;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredSession(): Session | null {
  const session = readJson<Session | null>(SESSION_KEY, null);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) return refreshSession(session);
  return session;
}

export function refreshSession(session: Session): Session {
  const refreshed = createSession(session.user);
  writeJson(SESSION_KEY, refreshed);
  return refreshed;
}
