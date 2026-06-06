import type {
  HttpMethod,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from "./openapi-types";

export interface EndpointDef {
  id: string;
  apiId: string;
  method: HttpMethod;
  path: string;
  name: string;
  description: string;
  parameters: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Array<{ status: string; response: ResponseObject }>;
}

const METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete"];

export function parseOpenApiSpec(apiId: string, spec: OpenAPIObject): EndpointDef[] {
  return Object.entries(spec.paths).flatMap(([path, item]) => {
    return METHODS.flatMap((method) => {
      const operation = item[method] as OperationObject | undefined;
      if (!operation) return [];
      const parameters = [...(item.parameters ?? []), ...(operation.parameters ?? [])];
      return [
        {
          id: `${apiId}:${method}:${path}`,
          apiId,
          method,
          path,
          name: operation.summary ?? operation.operationId ?? `${method.toUpperCase()} ${path}`,
          description: operation.description ?? spec.info.description ?? "",
          parameters,
          requestBody: operation.requestBody,
          responses: Object.entries(operation.responses ?? {}).map(([status, response]) => ({
            status,
            response,
          })),
        },
      ];
    });
  });
}

export function describeSchema(schema: SchemaObject | undefined): string {
  if (!schema) return "unknown";
  if (typeof schema === "boolean") return schema ? "any" : "never";
  if (schema.$ref) return schema.$ref.split("/").at(-1) ?? schema.$ref;
  if (schema.enum) return schema.enum.join(" | ");
  if (schema.type === "array") return `${describeSchema(schema.items)}[]`;
  if (schema.oneOf) return `oneOf(${schema.oneOf.map(describeSchema).join(", ")})`;
  if (schema.anyOf) return `anyOf(${schema.anyOf.map(describeSchema).join(", ")})`;
  if (schema.allOf) return `allOf(${schema.allOf.map(describeSchema).join(", ")})`;
  return [schema.type, schema.format].filter(Boolean).join(":") || "object";
}

export function schemaExample(schema: SchemaObject | undefined): unknown {
  if (!schema || typeof schema === "boolean") return {};
  if (schema.example !== undefined) return schema.example;
  if (schema.enum?.length) return schema.enum[0];
  if (schema.type === "string") return schema.format === "date-time" ? "2026-06-06T12:00:00Z" : "string";
  if (schema.type === "integer" || schema.type === "number") return 1;
  if (schema.type === "boolean") return true;
  if (schema.type === "array") return [schemaExample(schema.items)];
  if (schema.properties) {
    return Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, schemaExample(value)]));
  }
  return {};
}

export function getJsonBodySchema(requestBody: RequestBodyObject | undefined): SchemaObject | undefined {
  return requestBody?.content?.["application/json"]?.schema;
}
