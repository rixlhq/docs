import type {OpenApiOperation, OpenApiResponse, OpenApiSchema} from "./types";
import {inferSchemaType} from "./openapi-schema";

export type RequestBodySummary = {
  contentType: string;
  required: boolean;
  description?: string;
  schema?: OpenApiSchema;
};

type ResponseContentSummary = {
  contentType: string;
  schema?: OpenApiSchema;
};

export function getRequestBodies(operation: OpenApiOperation): RequestBodySummary[] {
  const bodies = [...collectRequestBodyContent(operation), ...collectBodyParameters(operation), ...collectFormDataParameters(operation)];

  return dedupeRequestBodies(bodies);
}

function collectRequestBodyContent(operation: OpenApiOperation): RequestBodySummary[] {
  const requestBody = operation.requestBody;
  if (!requestBody) return [];

  const requestContent = Object.entries(requestBody.content ?? {});
  if (requestContent.length === 0) {
    return [
      {
        contentType: "application/json",
        required: Boolean(requestBody.required),
        description: requestBody.description,
      },
    ];
  }

  return requestContent.map(([contentType, media]) => ({
    contentType,
    required: Boolean(requestBody.required),
    description: requestBody.description,
    schema: media?.schema,
  }));
}

function collectBodyParameters(operation: OpenApiOperation): RequestBodySummary[] {
  const bodyParameters = operation.parameters?.filter((parameter) => parameter.in === "body") ?? [];
  if (bodyParameters.length === 0) return [];

  const contentTypes = operation.consumes && operation.consumes.length > 0 ? operation.consumes : ["application/json"];
  const results: RequestBodySummary[] = [];

  for (const parameter of bodyParameters) {
    for (const contentType of contentTypes) {
      results.push({
        contentType,
        required: Boolean(parameter.required),
        description: parameter.description,
        schema: parameter.schema,
      });
    }
  }

  return results;
}

function collectFormDataParameters(operation: OpenApiOperation): RequestBodySummary[] {
  const formDataParameters = operation.parameters?.filter((parameter) => parameter.in === "formData") ?? [];
  if (formDataParameters.length === 0) return [];

  const properties: Record<string, OpenApiSchema> = {};
  const required: string[] = [];
  for (const parameter of formDataParameters) {
    if (!parameter.name) continue;
    properties[parameter.name] = {
      type: parameter.type,
      format: parameter.format,
      description: parameter.description,
      enum: parameter.enum,
    };
    if (parameter.required) required.push(parameter.name);
  }

  const formSchema: OpenApiSchema = {
    type: "object",
    properties,
    required,
  };

  const contentTypes = operation.consumes && operation.consumes.length > 0 ? operation.consumes : ["multipart/form-data"];
  return contentTypes.map((contentType) => ({
    contentType,
    required: required.length > 0,
    schema: formSchema,
  }));
}

function dedupeRequestBodies(entries: RequestBodySummary[]) {
  const seen = new Set<string>();
  const deduped: RequestBodySummary[] = [];

  for (const entry of entries) {
    const key = `${entry.contentType}|${entry.required}|${entry.description ?? ""}|${schemaSignature(entry.schema)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }

  return deduped;
}

export function getResponseContents(response: OpenApiResponse, produces: string[] | undefined): ResponseContentSummary[] {
  const entries: ResponseContentSummary[] = [];
  const contentEntries = Object.entries(response.content ?? {});

  if (contentEntries.length > 0) {
    for (const [contentType, media] of contentEntries) {
      entries.push({
        contentType,
        schema: media?.schema,
      });
    }
  }

  if (response.schema) {
    const responseContentTypes = produces && produces.length > 0 ? produces : ["application/json"];
    for (const contentType of responseContentTypes) {
      entries.push({
        contentType,
        schema: response.schema,
      });
    }
  }

  if (entries.length === 0) {
    entries.push({contentType: "n/a"});
  }

  return dedupeResponseContents(entries);
}

function dedupeResponseContents(entries: ResponseContentSummary[]) {
  const seen = new Set<string>();
  const deduped: ResponseContentSummary[] = [];

  for (const entry of entries) {
    const key = `${entry.contentType}|${schemaSignature(entry.schema)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }

  return deduped;
}

function schemaSignature(schema: OpenApiSchema | undefined) {
  if (!schema) return "none";
  if (schema.$ref) return `ref:${schema.$ref}`;
  const type = Array.isArray(schema.type) ? schema.type.join("|") : (schema.type ?? inferSchemaType(schema));
  const propertyCount = Object.keys(schema.properties ?? {}).length;
  const enumCount = schema.enum?.length ?? 0;
  return `${type}|${schema.format ?? ""}|p:${propertyCount}|e:${enumCount}`;
}
