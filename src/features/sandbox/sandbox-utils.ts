import type { ApiDefinition } from '@/apis/api-registry';
import type { EndpointDef, ParameterDef } from '@/lib/spec-parser';

export type SandboxFieldValues = Record<string, string>;

export type BuiltSandboxRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

export type SandboxExecutionResult = {
  status: number;
  ok: boolean;
  latencyMs: number;
  data: unknown;
};

export type SandboxSnippet = {
  id: 'curl' | 'javascript' | 'python';
  label: string;
  code: string;
};

export function getParametersByLocation(endpoint: EndpointDef, location: ParameterDef['in']) {
  return endpoint.parameters.filter((parameter) => parameter.in === location);
}

export function buildInitialValues(parameters: ParameterDef[]): SandboxFieldValues {
  return parameters.reduce<SandboxFieldValues>((values, parameter) => {
    values[parameter.name] = '';
    return values;
  }, {});
}

export function buildSandboxRequest(
  api: ApiDefinition,
  endpoint: EndpointDef,
  pathParams: SandboxFieldValues,
  queryParams: SandboxFieldValues,
  headers: SandboxFieldValues,
  body: string,
): BuiltSandboxRequest {
  const path = Object.entries(pathParams).reduce(
    (currentPath, [name, value]) =>
      currentPath.replace(`{${name}}`, encodeURIComponent(value.trim())),
    endpoint.path,
  );
  const url = new URL(`${api.baseUrl}${path}`);

  Object.entries(queryParams).forEach(([name, value]) => {
    if (value.trim()) {
      url.searchParams.set(name, value.trim());
    }
  });

  const requestHeaders = Object.fromEntries(
    Object.entries(headers).filter(([, value]) => value.trim().length > 0),
  );
  const trimmedBody = body.trim();

  return {
    method: endpoint.method.toUpperCase(),
    url: url.toString(),
    headers: requestHeaders,
    body: trimmedBody.length > 0 ? trimmedBody : undefined,
  };
}

export function injectAuthToken(
  request: BuiltSandboxRequest,
  accessToken: string | undefined,
): BuiltSandboxRequest {
  if (!accessToken) {
    return request;
  }

  return {
    ...request,
    headers: {
      ...request.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function executeSandboxRequest(
  request: BuiltSandboxRequest,
): Promise<SandboxExecutionResult> {
  const startedAt = performance.now();
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  const latencyMs = Math.round(performance.now() - startedAt);
  const data = await parseResponseBody(response);

  return {
    status: response.status,
    ok: response.ok,
    latencyMs,
    data,
  };
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function formatHeadersForJavaScript(headers: Record<string, string>): string {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return '{}';
  }

  return JSON.stringify(headers, null, 2);
}

function formatHeadersForPython(headers: Record<string, string>): string {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return '{}';
  }

  return JSON.stringify(headers, null, 2);
}

export function generateCurlSnippet(request: BuiltSandboxRequest): string {
  const parts = ['curl', '-X', request.method, shellQuote(request.url)];

  Object.entries(request.headers).forEach(([name, value]) => {
    parts.push('-H', shellQuote(`${name}: ${value}`));
  });

  if (request.body) {
    parts.push('--data', shellQuote(request.body));
  }

  return parts.join(' \\\n  ');
}

export function generateJavaScriptFetchSnippet(request: BuiltSandboxRequest): string {
  const bodyLine = request.body ? `,\n  body: ${JSON.stringify(request.body)}` : '';

  return `const response = await fetch(${JSON.stringify(request.url)}, {
  method: ${JSON.stringify(request.method)},
  headers: ${formatHeadersForJavaScript(request.headers)}${bodyLine}
});

const data = await response.json();
console.log(data);`;
}

export function generatePythonRequestsSnippet(request: BuiltSandboxRequest): string {
  const bodyLine = request.body ? `,\n    data=${JSON.stringify(request.body)}` : '';

  return `import requests

response = requests.request(
    ${JSON.stringify(request.method)},
    ${JSON.stringify(request.url)},
    headers=${formatHeadersForPython(request.headers)}${bodyLine}
)

print(response.json())`;
}

export function generateSandboxSnippets(request: BuiltSandboxRequest): SandboxSnippet[] {
  return [
    {
      id: 'curl',
      label: 'cURL',
      code: generateCurlSnippet(request),
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      code: generateJavaScriptFetchSnippet(request),
    },
    {
      id: 'python',
      label: 'Python',
      code: generatePythonRequestsSnippet(request),
    },
  ];
}
