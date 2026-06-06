import type { EndpointDef } from "./spec-parser";

export interface SandboxState {
  baseUrl: string;
  headers: Record<string, string>;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
  authToken?: string;
}

export function buildRequestUrl(endpoint: EndpointDef, state: SandboxState): string {
  const path = endpoint.path.replace(/\{([^}]+)\}/g, (_, key: string) => encodeURIComponent(state.pathParams[key] || `{${key}}`));
  const url = new URL(`${state.baseUrl.replace(/\/$/, "")}${path}`);
  Object.entries(state.queryParams).forEach(([key, value]) => {
    if (value.trim()) url.searchParams.set(key, value);
  });
  return url.toString();
}

export function requestHeaders(state: SandboxState): Record<string, string> {
  return {
    ...state.headers,
    ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
  };
}

export function generateCurl(endpoint: EndpointDef, state: SandboxState): string {
  const allowsBody = endpoint.method !== "get" && endpoint.method !== "delete";
  const headers = Object.entries(requestHeaders(state))
    .filter(([, value]) => value)
    .map(([key, value]) => `  -H ${JSON.stringify(`${key}: ${value}`)}`)
    .join(" \\\n");
  const body = allowsBody && state.body.trim() ? ` \\\n  -d ${JSON.stringify(state.body)}` : "";
  return [`curl -X ${endpoint.method.toUpperCase()} ${JSON.stringify(buildRequestUrl(endpoint, state))}`, headers, body]
    .filter(Boolean)
    .join(" \\\n");
}

export function generateFetch(endpoint: EndpointDef, state: SandboxState): string {
  const hasBody = endpoint.method !== "get" && endpoint.method !== "delete" && state.body.trim().length > 0;
  return `await fetch(${JSON.stringify(buildRequestUrl(endpoint, state))}, {
  method: ${JSON.stringify(endpoint.method.toUpperCase())},
  headers: ${JSON.stringify(requestHeaders(state), null, 2)},
${hasBody ? `  body: JSON.stringify(${state.body}),\n` : ""}});`;
}

export function generatePython(endpoint: EndpointDef, state: SandboxState): string {
  const hasBody = endpoint.method !== "get" && endpoint.method !== "delete" && state.body.trim().length > 0;
  return `import requests

response = requests.${endpoint.method}(
    ${JSON.stringify(buildRequestUrl(endpoint, state))},
    headers=${JSON.stringify(requestHeaders(state), null, 4)}${hasBody ? `,\n    json=${state.body}` : ""}
)
print(response.status_code)
print(response.json())`;
}
