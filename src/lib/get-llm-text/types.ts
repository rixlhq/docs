import type {ApiPageProps} from "fumadocs-openapi/ui";
import type {ApiServer, ApiServerRoot} from "@/lib/api-base-url";

export interface OpenApiSchema {
  $ref?: string;
  type?: string | string[];
  format?: string;
  description?: string;
  nullable?: boolean;
  enum?: unknown[];
  required?: string[];
  properties?: Record<string, OpenApiSchema | undefined>;
  items?: OpenApiSchema;
  allOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  additionalProperties?: boolean | OpenApiSchema;
}

export interface OpenApiMediaType {
  schema?: OpenApiSchema;
}

export interface OpenApiResponse {
  description?: string;
  schema?: OpenApiSchema;
  content?: Record<string, OpenApiMediaType | undefined>;
}

export type OpenApiServer = ApiServer;

export interface OpenApiSecurityRequirement {
  [schemeName: string]: string[] | undefined;
}

export interface OpenApiSecurityScheme {
  type?: string;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  security?: OpenApiSecurityRequirement[];
  servers?: OpenApiServer[];
  consumes?: string[];
  produces?: string[];
  parameters?: Array<{
    name?: string;
    in?: string;
    required?: boolean;
    description?: string;
    type?: string;
    format?: string;
    enum?: unknown[];
    schema?: OpenApiSchema;
  }>;
  requestBody?: {
    required?: boolean;
    description?: string;
    content?: Record<string, OpenApiMediaType | undefined>;
  };
  responses?: Record<string, OpenApiResponse | undefined>;
}

export interface OpenApiDereferencedSchema extends ApiServerRoot {
  paths?: Record<string, Record<string, OpenApiOperation | undefined> | undefined>;
  webhooks?: Record<string, Record<string, OpenApiOperation | undefined> | undefined>;
  components?: {
    securitySchemes?: Record<string, OpenApiSecurityScheme | undefined>;
  };
  securityDefinitions?: Record<string, OpenApiSecurityScheme | undefined>;
  security?: OpenApiSecurityRequirement[];
}

export interface OpenApiRootSchema {
  id: string;
  bundled: unknown;
}

export interface LLMPage {
  url: string;
  data: {
    title: string;
    description?: string;
    type?: string;
    getText?: (format: "processed") => Promise<string>;
    getAPIPageProps?: () => Omit<ApiPageProps, "document">;
    getSchema?: () => OpenApiRootSchema;
  };
}

export type OpenApiLLMPage = LLMPage & {
  data: LLMPage["data"] & {
    getAPIPageProps: () => Omit<ApiPageProps, "document">;
    getSchema: () => OpenApiRootSchema;
  };
};

export interface OpenApiPageData {
  title?: string;
  description?: string;
  getAPIPageProps?: () => Omit<ApiPageProps, "document">;
  getSchema?: () => OpenApiRootSchema;
}

export interface SchemaRenderContext {
  lines: string[];
  seenRefs: Set<string>;
  seenObjects: Set<OpenApiSchema>;
}
