import "@tanstack/react-start/server-only";
import {createOpenAPI} from "fumadocs-openapi/server";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {parse} from "yaml";
import {API_BASE_URL} from "./api-base-url.ts";

/**
 * The API contract, read from the spec repo at build time.
 *
 * There is deliberately no copy of it in this repo. The one that used to live
 * here was maintained by hand and had drifted: a Swagger 2.0 snapshot missing 61
 * endpoints, still describing routes that had been renamed. Every other consumer
 * already reads the spec over HTTP — rixl-js generates its SDK from the YAML the
 * same way — so docs does too, and there is nothing local to fall behind.
 *
 * YAML rather than JSON because `openapi.yaml` is the single source of truth in
 * the spec repo; `openapi.json` is a generated convenience copy. The spec can
 * also be read from a local file by setting `RIXL_OPENAPI_SPEC_URL`.
 */
const SPEC_URL =
  process.env.RIXL_OPENAPI_SPEC_URL ?? "https://raw.githubusercontent.com/rixlhq/openapi/main/openapi.yaml";

const OPENAPI_DOCUMENT_ID = "rixl-api";

/** Service-to-service routes; not part of the published API. */
const EXCLUDED_PATH_PREFIXES = new Set(["internal"]);

const FETCH_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 30_000;

let documentPromise: Promise<Record<string, unknown>> | undefined;

async function resolveProjectRoot(): Promise<string> {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 20; depth++) {
    const packagePath = resolve(dir, "package.json");
    try {
      const contents = await readFile(packagePath, "utf8");
      const pkg = JSON.parse(contents) as {name?: string};
      if (pkg.name === "rixl-docs") return dir;
    } catch {
      // keep walking
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Could not resolve rixl-docs project root");
}

async function readLocalSpec(specPath: string): Promise<Record<string, unknown>> {
  const path = specPath.startsWith("file://") ? fileURLToPath(specPath) : specPath;
  const text = await readFile(path, "utf8");
  return parse(text) as Record<string, unknown>;
}

async function fetchRemoteSpec(): Promise<Record<string, unknown>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(SPEC_URL, {signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)});
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return parse(await response.text()) as Record<string, unknown>;
    } catch (error) {
      lastError = error;
      console.warn(`[openapi] attempt ${attempt}/${FETCH_ATTEMPTS} to read the spec failed:`, error);
    }
  }

  throw new Error(`Could not read the API spec from ${SPEC_URL}: ${String(lastError)}`);
}

async function fetchSpec(projectRoot: string): Promise<Record<string, unknown>> {
  if (SPEC_URL.startsWith("file://")) return readLocalSpec(SPEC_URL);
  if (!SPEC_URL.includes("://")) return readLocalSpec(resolve(projectRoot, SPEC_URL));
  return fetchRemoteSpec();
}

function assertValidSpec(document: Record<string, unknown>): void {
  if (!document || typeof document !== "object") {
    throw new TypeError("API spec must be an object");
  }
  const isOpenApi = typeof document.openapi === "string";
  const isSwagger = typeof document.swagger === "string";
  if (!isOpenApi && !isSwagger) {
    throw new TypeError("API spec must declare a valid openapi or swagger version");
  }
  if (!document.paths || typeof document.paths !== "object" || Array.isArray(document.paths)) {
    throw new TypeError("API spec is missing a valid paths object");
  }
  if (Object.keys(document.paths).length === 0) {
    throw new TypeError("API spec has no paths");
  }
}

async function loadDocument(): Promise<Record<string, unknown>> {
  const projectRoot = await resolveProjectRoot();
  const cachePath = join(projectRoot, "node_modules", ".cache", "rixl-openapi.json");
  let document: Record<string, unknown>;

  try {
    document = await fetchSpec(projectRoot);
    assertValidSpec(document);
    await mkdir(dirname(cachePath), {recursive: true});
    await writeFile(cachePath, JSON.stringify(document));
  } catch (error) {
    // Serving the last good copy beats failing the build outright; it is only
    // ever as stale as the previous successful build.
    const cached = await readFile(cachePath, "utf8").catch(() => undefined);
    if (cached === undefined) throw error;

    console.warn("[openapi] using the cached spec from the last successful build:", error);
    document = JSON.parse(cached) as Record<string, unknown>;
  }

  return normalizeApiTags(withDefaultApiHost(withoutInternalPaths(document)));
}

/** Memoised on the promise, so a build fetches the spec once rather than per page. */
function prepareDocument() {
  return (documentPromise ??= loadDocument());
}

function withoutInternalPaths(document: Record<string, unknown>) {
  const paths = document.paths;
  if (!paths || typeof paths !== "object") return document;

  const published = Object.entries(paths as Record<string, unknown>).filter(
    ([path]) => !EXCLUDED_PATH_PREFIXES.has(path.replace(/^\//, "").split("/")[0] ?? "")
  );

  return {...document, paths: Object.fromEntries(published)};
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
  let tags = Array.isArray(op.tags) ? (op.tags as string[]) : [];
  if (tags.length === 0) tags = ["General"];
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
