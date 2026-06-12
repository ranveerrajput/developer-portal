import type { ApiDefinition } from '@/apis/api-registry';
import { parseOpenApiSpec, type EndpointDef } from '@/lib/spec-parser';

export type EndpointSearchItem = {
  apiId: string;
  apiName: string;
  endpoint: EndpointDef;
  searchText: string;
};

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function buildEndpointSearchText(endpoint: EndpointDef) {
  return normalizeSearchText(
    [
      endpoint.id,
      endpoint.operationId,
      endpoint.summary,
      endpoint.description,
      endpoint.path,
      endpoint.method,
      ...endpoint.parameters.flatMap((parameter) => [
        parameter.name,
        parameter.in,
        parameter.description,
      ]),
    ]
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .join(' '),
  );
}

export function buildEndpointSearchIndex(apis: ApiDefinition[]): EndpointSearchItem[] {
  return apis.flatMap((api) =>
    parseOpenApiSpec(api.spec).map((endpoint) => ({
      apiId: api.id,
      apiName: api.name,
      endpoint,
      searchText: buildEndpointSearchText(endpoint),
    })),
  );
}

export function searchEndpoints(items: EndpointSearchItem[], query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return items;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return items.filter((item) => terms.every((term) => item.searchText.includes(term)));
}
