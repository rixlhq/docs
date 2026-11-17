import type {OpenApiSchema, SchemaRenderContext} from "./types";
import {normalizeInlineText} from "./utils";

type SchemaNodeOptions = {
  depth: number;
  name: string;
  required: boolean;
};

export function createSchemaContext(lines: string[]): SchemaRenderContext {
  return {
    lines,
    seenRefs: new Set(),
    seenObjects: new Set(),
  };
}

export function appendSchemaNode(schema: OpenApiSchema, context: SchemaRenderContext, options: SchemaNodeOptions) {
  const {lines} = context;
  const indent = "  ".repeat(options.depth);
  const requiredSuffix = options.required ? "*" : "";
  const typeLabel = getSchemaTypeLabel(schema);
  const description = normalizeInlineText(schema.description);

  lines.push(`${indent}- \`${options.name}${requiredSuffix}\`: ${typeLabel}${description ? ` - ${description}` : ""}`);
  appendEnumLine(schema, lines, indent);

  if (handleRefs(schema, context, indent)) return;
  if (markSeen(schema, context)) return;

  appendProperties(schema, context, options.depth);
  appendItems(schema, context, options.depth);
  appendCompositeList({label: "All of", key: "allOf", entries: schema.allOf, context, depth: options.depth});
  appendCompositeList({label: "One of", key: "oneOf", entries: schema.oneOf, context, depth: options.depth});
  appendCompositeList({label: "Any of", key: "anyOf", entries: schema.anyOf, context, depth: options.depth});
  appendAdditionalProperties(schema, context, options.depth);
}

function appendEnumLine(schema: OpenApiSchema, lines: string[], indent: string) {
  if (!schema.enum || schema.enum.length === 0) return;
  lines.push(`${indent}  - Enum: ${schema.enum.map(formatLiteral).join(", ")}`);
}

function handleRefs(schema: OpenApiSchema, context: SchemaRenderContext, indent: string) {
  if (!schema.$ref) return false;
  if (context.seenRefs.has(schema.$ref)) {
    context.lines.push(`${indent}  - Circular reference: \`${schema.$ref}\``);
    return true;
  }
  context.seenRefs.add(schema.$ref);
  return false;
}

function markSeen(schema: OpenApiSchema, context: SchemaRenderContext) {
  if (context.seenObjects.has(schema)) return true;
  context.seenObjects.add(schema);
  return false;
}

function appendProperties(schema: OpenApiSchema, context: SchemaRenderContext, depth: number) {
  const properties = Object.entries(schema.properties ?? {});
  if (properties.length === 0) return;

  const requiredSet = new Set(schema.required ?? []);
  const indent = "  ".repeat(depth);
  context.lines.push(`${indent}  - Fields:`);

  for (const [propertyName, propertySchema] of properties.sort(([left], [right]) => left.localeCompare(right))) {
    if (!propertySchema) continue;
    appendSchemaNode(propertySchema, context, {
      depth: depth + 2,
      name: propertyName,
      required: requiredSet.has(propertyName),
    });
  }
}

function appendItems(schema: OpenApiSchema, context: SchemaRenderContext, depth: number) {
  if (!schema.items) return;
  const indent = "  ".repeat(depth);
  context.lines.push(`${indent}  - Items:`);
  appendSchemaNode(schema.items, context, {depth: depth + 2, name: "item", required: true});
}

type CompositeListInput = {
  label: string;
  key: string;
  entries: OpenApiSchema[] | undefined;
  context: SchemaRenderContext;
  depth: number;
};

function appendCompositeList({label, key, entries, context, depth}: CompositeListInput) {
  if (!entries || entries.length === 0) return;
  const indent = "  ".repeat(depth);
  context.lines.push(`${indent}  - ${label}:`);
  for (const [index, entry] of entries.entries()) {
    appendSchemaNode(entry, context, {depth: depth + 2, name: `${key}[${index}]`, required: true});
  }
}

function appendAdditionalProperties(schema: OpenApiSchema, context: SchemaRenderContext, depth: number) {
  const indent = "  ".repeat(depth);
  if (typeof schema.additionalProperties === "object" && schema.additionalProperties !== null) {
    context.lines.push(`${indent}  - Additional properties:`);
    appendSchemaNode(schema.additionalProperties, context, {depth: depth + 2, name: "<key>", required: true});
    return;
  }

  if (schema.additionalProperties === true) {
    context.lines.push(`${indent}  - Additional properties: allowed`);
  }
}

export function getSchemaTypeLabel(schema: OpenApiSchema) {
  if (schema.$ref) {
    const refName = schema.$ref.split("/").at(-1) ?? schema.$ref;
    return `ref<${refName}>`;
  }

  const rawType = Array.isArray(schema.type) ? schema.type.join("|") : schema.type;
  const type = rawType ?? inferSchemaType(schema);
  const format = schema.format ? ` (${schema.format})` : "";
  const nullable = schema.nullable ? " | null" : "";
  return `${type}${format}${nullable}`;
}

export function inferSchemaType(schema: OpenApiSchema) {
  if (schema.properties) return "object";
  if (schema.items) return "array";
  if (schema.allOf) return "allOf";
  if (schema.oneOf) return "oneOf";
  if (schema.anyOf) return "anyOf";
  return "unknown";
}

export function formatLiteral(value: unknown) {
  if (typeof value === "string") return `\`${value}\``;
  return `\`${JSON.stringify(value)}\``;
}
