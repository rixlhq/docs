import type {OperationItem, WebhookItem} from "fumadocs-openapi/ui";
// @ts-expect-error -- internal util, no public subpath or types in v11
import {dereferenceBundledDocument} from "../../../node_modules/fumadocs-openapi/dist/utils/document/dereference.js";
import {appendOperationDetails} from "./openapi-details";
import type {OpenApiDereferencedSchema, OpenApiLLMPage, OpenApiOperation} from "./types";

function buildHeaderLines(page: OpenApiLLMPage): string[] {
  const lines: string[] = [`# ${page.data.title} (${page.url})`, ""];
  if (page.data.description) {
    lines.push(page.data.description, "");
  }
  return lines;
}

function appendOperations(lines: string[], items: OperationItem[] | undefined, schema: OpenApiDereferencedSchema | undefined) {
  if (!items || items.length === 0) return;
  lines.push("## Operations", "");
  for (const item of items) {
    lines.push(...renderOperationSection(item, schema?.paths?.[item.path]?.[item.method], schema));
  }
}

function appendWebhooks(lines: string[], items: WebhookItem[] | undefined, schema: OpenApiDereferencedSchema | undefined) {
  if (!items || items.length === 0) return;
  lines.push("## Webhooks", "");
  for (const item of items) {
    lines.push(...renderWebhookSection(item, schema?.webhooks?.[item.name]?.[item.method], schema));
  }
}

function renderOperationSection(
  item: OperationItem,
  operation: OpenApiOperation | undefined,
  schema: OpenApiDereferencedSchema | undefined
) {
  const method = item.method.toUpperCase();
  const title = operation?.summary || operation?.operationId || `${method} ${item.path}`;
  const lines = [`### ${title}`, "", `- Method: \`${method}\``, `- Path: \`${item.path}\``];
  appendOperationDetails(lines, operation, schema);
  lines.push("");
  return lines;
}

function renderWebhookSection(item: WebhookItem, operation: OpenApiOperation | undefined, schema: OpenApiDereferencedSchema | undefined) {
  const method = item.method.toUpperCase();
  const title = operation?.summary || operation?.operationId || `${method} /${item.name}`;
  const lines = [`### ${title}`, "", `- Method: \`${method}\``, `- Webhook: \`/${item.name}\``];
  appendOperationDetails(lines, operation, schema);
  lines.push("");
  return lines;
}

export function renderOpenApiMarkdown(page: OpenApiLLMPage) {
  const props = page.data.getAPIPageProps();
  const schema = dereferenceBundledDocument(page.data.getSchema().bundled).dereferenced as OpenApiDereferencedSchema;

  const lines = buildHeaderLines(page);
  appendOperations(lines, props.operations, schema);
  appendWebhooks(lines, props.webhooks, schema);

  if (!props.operations?.length && !props.webhooks?.length) {
    lines.push("No OpenAPI operations were found for this page.");
  }

  return `${lines.join("\n")}\n`;
}
