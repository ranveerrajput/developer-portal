export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface OpenAPIObject {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, PathItemObject>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}

export type SchemaObject =
  | {
      type?: string;
      format?: string;
      description?: string;
      enum?: string[];
      properties?: Record<string, SchemaObject>;
      items?: SchemaObject;
      required?: string[];
      example?: unknown;
      oneOf?: SchemaObject[];
      anyOf?: SchemaObject[];
      allOf?: SchemaObject[];
      $ref?: string;
    }
  | boolean;

export interface PathItemObject {
  parameters?: ParameterObject[];
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
}

export interface OperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
}

export interface ParameterObject {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
  example?: unknown;
}

export interface RequestBodyObject {
  required?: boolean;
  description?: string;
  content?: Record<string, MediaTypeObject>;
}

export interface ResponseObject {
  description?: string;
  content?: Record<string, MediaTypeObject>;
}

export interface MediaTypeObject {
  schema?: SchemaObject;
  example?: unknown;
}
