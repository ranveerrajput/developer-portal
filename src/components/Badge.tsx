import type { ReactNode } from "react";

export function MethodBadge({ method }: { method: string }) {
  return <span className={`badge method method-${method.toLowerCase()}`}>{method.toUpperCase()}</span>;
}

export function StatusBadge({ status }: { status: string | number }) {
  const code = Number(status);
  const tone = code >= 500 ? "server" : code >= 400 ? "client" : code >= 300 ? "redirect" : code >= 200 ? "success" : "neutral";
  return <span className={`badge status status-${tone}`}>{status}</span>;
}

export function TypeBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge tone-${tone}`}>{children}</span>;
}
