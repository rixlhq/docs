import "@tanstack/react-start/server-only";
import {createOpenAPI} from "fumadocs-openapi/server";
import apiDocument from "../../api.json";
import {API_BASE_URL} from "./api-base-url";

const OPENAPI_DOCUMENT_ID = "./api.json";

let preparedDocument: Record<string, unknown> | undefined;

function prepareDocument() {
  return (preparedDocument ??= normalizeApiTags(withDefaultApiHost(apiDocument as Record<string, unknown>)));
}

export const openapi = createOpenAPI({
  input: {
    [OPENAPI_DOCUMENT_ID]: prepareDocument,
  },
});

function withDefaultApiHost(document: Record<string, unknown>) {
  const parsed = new URL(API_BASE_URL);

  if (typeof document.swagger === "string") {
    return {
      ...document,
      host: typeof document.host === "string" && document.host.length > 0 ? document.host : parsed.host,
      schemes: ["https"],
      basePath: typeof document.basePath === "string" && document.basePath.length > 0 ? document.basePath : "/",
    };
  }

  if (typeof document.openapi === "string") {
    const existingServers = Array.isArray(document.servers)
      ? document.servers
          .map((server) => {
            if (!server || typeof server !== "object") return;
            const record = server as Record<string, unknown>;
            const rawUrl = typeof record.url === "string" ? record.url : undefined;
            // A bare "/" (relative root) produces broken example URLs; fall back to API_BASE_URL.
            if (!rawUrl || rawUrl === "/") return;
            return {...record, url: rawUrl.replace(/^http:\/\//u, "https://")};
          })
          .filter(Boolean)
      : [];
    return {
      ...document,
      servers: existingServers.length > 0 ? existingServers : [{url: API_BASE_URL}],
    };
  }

  return document;
}

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "patch", "options", "head", "trace"]);

// fumadocs `groupBy: "tag"` renders one sidebar section per tag and drops any operation whose
// tag is missing from the top-level `tags` list. fumadocs has no native `x-tagGroups` support,
// but its tag slugifier keeps "/" as a path separator, so naming a tag `Group/Leaf` (no spaces
// around the slash, to avoid stray dashes) produces a two-level nav: tag-group -> tag ->
// operations. Rewrite every used tag to `<x-tagGroup>/<x-displayName>` and register it as a
// top-level tag so nothing is dropped.
type TagMeta = Map<string, Record<string, unknown>>;

function buildTagGroupMap(tagGroups: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(tagGroups)) return map;
  for (const group of tagGroups as Array<Record<string, unknown>>) {
    const groupName = typeof group?.name === "string" ? group.name : undefined;
    const groupTags = Array.isArray(group?.tags) ? (group.tags as string[]) : [];
    if (groupName) for (const tag of groupTags) map.set(tag, groupName);
  }
  return map;
}

function leafNameFor(tag: string, meta: TagMeta): string {
  const display = meta.get(tag)?.["x-displayName"];
  if (typeof display === "string" && display.length > 0) return display;
  const leaf = tag.split("/").pop()?.trim();
  return leaf && leaf.length > 0 ? leaf : tag;
}

interface TagRewriteContext {
  groups: Map<string, string>;
  meta: TagMeta;
  sections: Map<string, Record<string, unknown>>;
}

function rewriteOperationTags(op: Record<string, unknown>, ctx: TagRewriteContext) {
  const tags = Array.isArray(op.tags) ? (op.tags as string[]) : [];
  op.tags = tags.map((tag) => {
    const leaf = leafNameFor(tag, ctx.meta);
    const group = ctx.groups.get(tag);
    const name = group ? `${group}/${leaf}` : leaf;
    if (!ctx.sections.has(name)) ctx.sections.set(name, {name, "x-displayName": leaf, description: ctx.meta.get(tag)?.description});
    return name;
  });
}

function normalizeApiTags(document: Record<string, unknown>) {
  if (typeof document.openapi !== "string") return document;

  const clone = structuredClone(document);
  const topLevelTags = Array.isArray(clone.tags) ? (clone.tags as Array<Record<string, unknown>>) : [];
  const ctx: TagRewriteContext = {
    groups: buildTagGroupMap(clone["x-tagGroups"]),
    meta: new Map(topLevelTags.map((tag) => [tag.name as string, tag] as const)),
    sections: new Map<string, Record<string, unknown>>(),
  };

  const paths = (clone.paths ?? {}) as Record<string, Record<string, unknown>>;
  for (const operations of Object.values(paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      if (!HTTP_METHODS.has(method) || !operation || typeof operation !== "object") continue;
      rewriteOperationTags(operation as Record<string, unknown>, ctx);
    }
  }

  clone.tags = Array.from(ctx.sections.values());
  return clone;
}
