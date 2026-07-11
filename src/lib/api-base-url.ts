export const API_BASE_URL = "https://api.rixl.com";

export interface ApiServerVariable {
  default?: string;
  description?: string;
}

export interface ApiServer {
  url?: string;
  description?: string;
  variables?: Record<string, ApiServerVariable | undefined>;
}

export interface ResolvedApiServer extends ApiServer {
  url: string;
}

export interface ApiServerRoot {
  servers?: ApiServer[];
  host?: string;
  schemes?: string[];
  basePath?: string;
}

export function absolutizeApiUrl(url: string) {
  const value = url.trim();
  if (value.length === 0 || value === "/") return API_BASE_URL;
  if (value.startsWith("https://")) return trimTrailingSlash(value);
  if (value.startsWith("http://")) return trimTrailingSlash(`https://${value.slice("http://".length)}`);

  const prefixed = value.startsWith("/") ? value : `/${value}`;
  if (prefixed === "/") return API_BASE_URL;
  return `${API_BASE_URL}${prefixed}`;
}

export function resolveApiServerTemplate(server: ApiServer) {
  if (!server.url) return;

  let resolved = server.url;
  for (const [name, variable] of Object.entries(server.variables ?? {})) {
    const replacement = variable?.default ?? "";
    resolved = resolved.replaceAll(`{${name}}`, replacement);
  }

  return absolutizeApiUrl(resolved);
}

export function buildApiUrlFromSwaggerHost(host: string, schemes?: string[], basePath?: string) {
  const normalizedSchemes = (schemes ?? []).map((value) => value.toLowerCase());
  const scheme = normalizedSchemes.includes("https") ? "https" : (normalizedSchemes[0] ?? "https");
  const normalizedBasePath = normalizeBasePath(basePath);
  return absolutizeApiUrl(`${scheme}://${host}${normalizedBasePath}`);
}

export function resolveOpenApiServers(root: ApiServerRoot | undefined, operationServers?: ApiServer[]): ResolvedApiServer[] {
  const operationResolved = normalizeServerList(operationServers);
  if (operationResolved.length > 0) return operationResolved;

  const rootResolved = normalizeServerList(root?.servers);
  if (rootResolved.length > 0) return rootResolved;

  if (root?.host) {
    return [{url: buildApiUrlFromSwaggerHost(root.host, root.schemes, root.basePath)}];
  }

  return [{url: API_BASE_URL}];
}

export function resolveOpenApiBaseUrl(root: ApiServerRoot | undefined, operationServers?: ApiServer[]) {
  return resolveOpenApiServers(root, operationServers)[0]?.url ?? API_BASE_URL;
}

export function joinApiUrl(base: string, pathname: string) {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!pathname) return normalizedBase;

  if (pathname.startsWith("/")) return `${normalizedBase}${pathname}`;
  return `${normalizedBase}/${pathname}`;
}

function normalizeBasePath(basePath: string | undefined) {
  if (!basePath || basePath === "/") return "";
  return basePath.startsWith("/") ? basePath : `/${basePath}`;
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeServerList(servers: ApiServer[] | undefined): ResolvedApiServer[] {
  if (!servers || servers.length === 0) return [];

  const seen = new Set<string>();
  const normalized: ResolvedApiServer[] = [];

  for (const server of servers) {
    const resolvedUrl = resolveApiServerTemplate(server);
    if (!resolvedUrl || seen.has(resolvedUrl)) continue;
    seen.add(resolvedUrl);
    normalized.push({
      ...server,
      url: resolvedUrl,
    });
  }

  return normalized;
}
