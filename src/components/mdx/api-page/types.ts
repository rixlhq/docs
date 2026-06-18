import type {ReactNode} from "react";
import type {CreateOpenAPIPageOptions} from "fumadocs-openapi/ui";
import type {ApiServer} from "@/lib/api-base-url";

type MediaAdapters = NonNullable<CreateOpenAPIPageOptions["mediaAdapters"]>;

export interface EncodedParameter {
  readonly value: string;
}

export interface EncodedParameterMultiple {
  readonly values: string[];
}

export interface EncodedRequestData {
  method: string;
  path: Record<string, EncodedParameter>;
  query: Record<string, EncodedParameterMultiple>;
  header: Record<string, EncodedParameter>;
  cookie: Record<string, EncodedParameter>;
  body?: unknown;
  bodyMediaType?: string;
}

export interface MethodWithPath {
  operationId?: string;
  summary?: string;
  servers?: ApiServer[];
  requestBody?: RequestBodyLite;
  responses?: Record<string, ResponseObjectLite>;
}

export interface PathItemLite {
  summary?: string;
  description?: string;
  servers?: ApiServer[];
  parameters?: unknown[];
}

export interface RequestBodyLite {
  required?: boolean;
  content?: Record<string, RequestMediaTypeLite>;
}

export interface RequestMediaTypeLite {
  example?: unknown;
  examples?: Record<string, RequestExampleLite>;
  schema?: SchemaLite;
}

export interface RequestExampleLite {
  summary?: string;
  description?: string;
  value?: unknown;
}

export interface ResponseObjectLite {
  description?: string;
  content?: Record<string, ResponseMediaTypeLite>;
}

export interface ResponseMediaTypeLite {
  example?: unknown;
  examples?: Record<string, ResponseExampleLite>;
  schema?: unknown;
}

export interface ResponseExampleLite {
  summary?: string;
  description?: string;
  value?: unknown;
}

export interface SchemaLite {
  type?: string | string[];
  description?: string;
  properties?: Record<string, SchemaLite>;
  required?: string[];
  items?: SchemaLite;
  enum?: unknown[];
  oneOf?: SchemaLite[];
  anyOf?: SchemaLite[];
  allOf?: SchemaLite[];
}

export interface RenderedSchemaProperty {
  name: string;
  schema: SchemaLite;
  required: boolean;
  description: ReactNode | null;
  children: RenderedSchemaProperty[];
}

export type RenderMarkdown = (markdown: string) => ReactNode;
export type RenderCodeBlock = (lang: string, code: string) => Promise<ReactNode>;

export interface OpenApiRenderContext {
  renderMarkdown: RenderMarkdown;
  renderCodeBlock: RenderCodeBlock;
  schema: unknown;
  mediaAdapters: MediaAdapters;
}

export interface ResponseTabExample {
  label?: string;
  description?: string;
  sample: unknown;
}

export interface ResponseTab {
  code: string;
  mediaType?: string;
  response: {description?: string};
  examples?: ResponseTabExample[];
}
