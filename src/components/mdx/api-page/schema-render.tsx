import type {ReactElement} from "react";
import type {OpenApiRenderContext, RenderedSchemaProperty, SchemaLite} from "./types";

const MAX_SCHEMA_DEPTH = 3;

type SchemaRenderContext = Pick<OpenApiRenderContext, "renderMarkdown">;

type BuildSchemaOptions = {
  depth?: number;
  seen?: Set<SchemaLite>;
};

export async function buildRenderedSchemaProperties(
  schema: SchemaLite | undefined,
  ctx: SchemaRenderContext,
  options: BuildSchemaOptions = {}
): Promise<RenderedSchemaProperty[]> {
  const depth = options.depth ?? 0;
  const seen = options.seen ?? new Set<SchemaLite>();
  if (!schema || depth > MAX_SCHEMA_DEPTH) return [];

  const props = getObjectProperties(schema);
  if (props.length === 0) return [];

  return Promise.all(
    props.map(async ({name, schema: propertySchema, required}) => {
      const nextSeen = new Set(seen);
      const canRecurse = !nextSeen.has(propertySchema);
      nextSeen.add(propertySchema);

      return {
        name,
        schema: propertySchema,
        required,
        description: propertySchema.description ? await ctx.renderMarkdown(propertySchema.description) : null,
        children: canRecurse ? await buildRenderedSchemaProperties(propertySchema, ctx, {depth: depth + 1, seen: nextSeen}) : [],
      };
    })
  );
}

export function renderSchemaProperties(properties: RenderedSchemaProperty[], keyPrefix: string, depth = 0): ReactElement[] {
  return properties.map((property, index) => (
    <div
      key={`${keyPrefix}:${depth}:${property.name}:${index}`}
      className={`text-sm ${depth === 0 ? "border-t py-4 first:border-t-0" : "border-t py-3 first:border-t-0"}`}
    >
      <div className={`flex flex-wrap items-center gap-3 not-prose ${depth > 0 ? "ps-1" : ""}`}>
        <span className="font-medium font-mono text-fd-primary">
          {property.name}
          {property.required ? <span className="text-red-400">*</span> : <span className="text-fd-muted-foreground">?</span>}
        </span>
        <span className="text-sm font-mono text-fd-muted-foreground">{schemaTypeLabel(property.schema)}</span>
      </div>

      <div className="prose-no-margin pt-2.5 empty:hidden">{property.description}</div>

      {property.schema.enum && property.schema.enum.length > 0 ? (
        <div className="flex flex-row gap-2 flex-wrap my-2 not-prose">
          <div className="flex flex-row items-start gap-2 bg-fd-secondary border rounded-lg text-xs p-1.5 shadow-md max-w-full">
            <span className="font-medium">Value in</span>
            <code className="min-w-0 flex-1 text-fd-muted-foreground truncate">
              {property.schema.enum.map((value) => JSON.stringify(value)).join(" | ")}
            </code>
          </div>
        </div>
      ) : null}

      {property.children.length > 0 ? (
        <div className="mt-2 border-s border-fd-border/70 ps-4">
          {renderSchemaProperties(property.children, `${keyPrefix}:${property.name}`, depth + 1)}
        </div>
      ) : null}
    </div>
  ));
}

function getArrayTypeLabel(schema: SchemaLite): string | null {
  if (schema.type !== "array") return null;
  const itemType = schema.items ? schemaTypeLabel(schema.items) : "unknown";
  return `array<${itemType}>`;
}

function getDirectTypeLabel(schema: SchemaLite): string | null {
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  if (schema.type) return schema.type;
  return null;
}

function getUnionTypeLabel(schema: SchemaLite): string | null {
  if (schema.oneOf && schema.oneOf.length > 0) return schema.oneOf.map(schemaTypeLabel).join(" | ");
  if (schema.anyOf && schema.anyOf.length > 0) return schema.anyOf.map(schemaTypeLabel).join(" | ");
  return null;
}

function hasObjectShape(schema: SchemaLite): boolean {
  const hasProperties = schema.properties && Object.keys(schema.properties).length > 0;
  const hasAllOf = schema.allOf && schema.allOf.length > 0;
  return Boolean(hasProperties || hasAllOf);
}

export function schemaTypeLabel(schema: SchemaLite): string {
  const arrayLabel = getArrayTypeLabel(schema);
  if (arrayLabel) return arrayLabel;

  const directLabel = getDirectTypeLabel(schema);
  if (directLabel) return directLabel;

  const unionLabel = getUnionTypeLabel(schema);
  if (unionLabel) return unionLabel;

  if (hasObjectShape(schema)) return "object";
  return "unknown";
}

function getObjectProperties(schema?: SchemaLite): Array<{name: string; schema: SchemaLite; required: boolean}> {
  if (!schema || typeof schema !== "object") return [];

  const mergedSchema = mergeAllOf(schema);
  if (mergedSchema.type === "array" && mergedSchema.items) {
    return getObjectProperties(mergedSchema.items);
  }
  const properties = mergedSchema.properties ?? {};
  const required = new Set(mergedSchema.required ?? []);

  return Object.entries(properties).map(([name, value]) => ({
    name,
    schema: value,
    required: required.has(name),
  }));
}

function mergeAllOf(schema: SchemaLite): SchemaLite {
  const allOf = schema.allOf ?? [];
  if (allOf.length === 0) return schema;

  const mergedProperties: Record<string, SchemaLite> = {...(schema.properties ?? {})};
  const mergedRequired = new Set(schema.required ?? []);

  for (const item of allOf) {
    for (const [name, value] of Object.entries(item.properties ?? {})) {
      mergedProperties[name] = value;
    }
    for (const name of item.required ?? []) {
      mergedRequired.add(name);
    }
  }

  return {
    ...schema,
    properties: mergedProperties,
    required: Array.from(mergedRequired),
  };
}
