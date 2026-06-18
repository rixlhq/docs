import {isValidElement} from "react";
import type {EncodedRequestData, MethodWithPath, OpenApiRenderContext} from "./types";

type OpenApiPaths = Record<string, Record<string, {operationId?: string; summary?: string} | undefined>>;

function getOpenApiPaths(ctx: OpenApiRenderContext): OpenApiPaths | undefined {
  return (ctx.schema as {paths?: OpenApiPaths})?.paths;
}

function findPathByOperationId(paths: OpenApiPaths, methodKey: string, operationId?: string): string | undefined {
  if (!operationId) return;
  for (const [path, pathItem] of Object.entries(paths)) {
    const operation = pathItem?.[methodKey];
    if (operation?.operationId === operationId) return path;
  }
}

function findPathBySummary(paths: OpenApiPaths, methodKey: string, summary?: string): string | undefined {
  if (!summary) return;
  for (const [path, pathItem] of Object.entries(paths)) {
    const operation = pathItem?.[methodKey];
    if (operation?.summary === summary) return path;
  }
}

export function findOperationPath({
  ctx,
  operation,
  method,
  headerNode,
}: {
  ctx: OpenApiRenderContext;
  operation: MethodWithPath;
  method: string;
  headerNode: unknown;
}): string | undefined {
  const pathFromHeader = extractPathFromHeader(headerNode);
  if (pathFromHeader) return pathFromHeader;

  const methodKey = method.toLowerCase();
  if (!methodKey) return;

  const paths = getOpenApiPaths(ctx);
  if (!paths) return;

  return findPathByOperationId(paths, methodKey, operation.operationId) ?? findPathBySummary(paths, methodKey, operation.summary);
}

export function extractPathFromHeader(node: unknown): string | undefined {
  const text = collectText(node).replace(/\s+/g, " ").trim();
  if (text.length === 0) return;

  const match = text.match(new RegExp("/[A-Za-z0-9\\-._~!$&'()*+,;=:@{}/]+", "g"));
  if (!match) return;

  for (const candidate of match) {
    if (candidate.length > 1) return candidate;
  }
}

function collectText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join(" ");
  if (!isValidElement(node)) return "";

  const props = node.props as {children?: unknown};
  return collectText(props.children);
}

export function resolveRequestPath(pathname: string, data: EncodedRequestData): string {
  let resolvedPath = pathname;
  for (const [key, param] of Object.entries(data.path)) {
    resolvedPath = resolvedPath.replace(`{${key}}`, param.value);
  }

  const [pathPart, existingQueryString] = resolvedPath.split("?", 2);
  const searchParams = new URLSearchParams(existingQueryString ?? "");
  for (const [key, param] of Object.entries(data.query)) {
    if (param.values.length === 0) continue;

    searchParams.delete(key);
    for (const value of param.values) {
      searchParams.append(key, value);
    }
  }

  const query = searchParams.toString();
  return query.length > 0 ? `${pathPart}?${query}` : pathPart;
}
