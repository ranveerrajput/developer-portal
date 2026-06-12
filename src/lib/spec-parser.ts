import type { OpenAPIObject } from '@/apis/api-registry';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export type ParameterDef = {
  name: string;
  in: ParameterLocation;
  required: boolean;
  description?: string;
  schema?: unknown;
};

export type ResponseDef = {
  statusCode: string;
  description: string;
  contentTypes: string[];
  schema?: unknown;
};

export type RequestBodyDef = {
  required: boolean;
  description?: string;
  contentTypes: string[];
  schema?: unknown;
};

export type EndpointDef = {
  id: string;
  method: HttpMethod;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: ParameterDef[];
  requestBody?: RequestBodyDef;
  responses: ResponseDef[];
};

type OpenApiPathItem = Record<string, unknown>;
type OpenApiOperation = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHttpMethod(value: string): value is HttpMethod {
  return HTTP_METHODS.includes(value as HttpMethod);
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function toEndpointId(method: HttpMethod, path: string, operationId?: string): string {
  if (operationId) {
    return operationId;
  }

  return `${method}-${path}`
    .replace(/[{}]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function parseParameter(value: unknown): ParameterDef | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = getString(value.name);
  const location = getString(value.in);

  if (!name || !isParameterLocation(location)) {
    return null;
  }

  return {
    name,
    in: location,
    required: getBoolean(value.required) ?? location === 'path',
    description: getString(value.description),
    schema: value.schema,
  };
}

function isParameterLocation(value: string | undefined): value is ParameterLocation {
  return value === 'path' || value === 'query' || value === 'header' || value === 'cookie';
}

function parseParameters(pathItem: OpenApiPathItem, operation: OpenApiOperation): ParameterDef[] {
  const pathParameters: unknown[] = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];
  const operationParameters: unknown[] = Array.isArray(operation.parameters) ? operation.parameters : [];

  return [...pathParameters, ...operationParameters]
    .map(parseParameter)
    .filter((parameter): parameter is ParameterDef => parameter !== null);
}

function parseContent(value: unknown): { contentTypes: string[]; schema?: unknown } {
  if (!isRecord(value)) {
    return { contentTypes: [], schema: undefined };
  }

  const contentTypes = Object.keys(value);
  const firstContent = value[contentTypes[0] ?? ''];

  if (!isRecord(firstContent)) {
    return { contentTypes, schema: undefined };
  }

  return { contentTypes, schema: firstContent.schema };
}

function parseRequestBody(value: unknown): RequestBodyDef | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { contentTypes, schema } = parseContent(value.content);

  return {
    required: getBoolean(value.required) ?? false,
    description: getString(value.description),
    contentTypes,
    schema,
  };
}

function parseResponses(value: unknown): ResponseDef[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .map(([statusCode, response]) => {
      if (!isRecord(response)) {
        return null;
      }

      const { contentTypes, schema } = parseContent(response.content);

      return {
        statusCode,
        description: getString(response.description) ?? '',
        contentTypes,
        schema,
      } satisfies ResponseDef;
    })
    .filter((response): response is ResponseDef => response !== null);
}

function parseOperation(
  path: string,
  method: HttpMethod,
  pathItem: OpenApiPathItem,
  value: unknown,
): EndpointDef | null {
  if (!isRecord(value)) {
    return null;
  }

  const operationId = getString(value.operationId);

  return {
    id: toEndpointId(method, path, operationId),
    method,
    path,
    operationId,
    summary: getString(value.summary),
    description: getString(value.description),
    tags: getStringArray(value.tags),
    parameters: parseParameters(pathItem, value),
    requestBody: parseRequestBody(value.requestBody),
    responses: parseResponses(value.responses),
  } satisfies EndpointDef;
}

export function parseOpenApiSpec(spec: OpenAPIObject): EndpointDef[] {
  if (!isRecord(spec.paths)) {
    return [];
  }

  return Object.entries(spec.paths).flatMap(([path, pathItem]) => {
    if (!isRecord(pathItem)) {
      return [];
    }

    return Object.entries(pathItem)
      .filter(([method]) => isHttpMethod(method))
      .map(([method, operation]) => parseOperation(path, method as HttpMethod, pathItem, operation))
      .filter((endpoint): endpoint is EndpointDef => endpoint !== null);
  });
}
