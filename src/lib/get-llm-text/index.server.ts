import "@tanstack/react-start/server-only";
import type {OpenAPIPageProps} from "fumadocs-openapi/ui";
import {openapiSource} from "fumadocs-openapi/server";
import {openapi} from "@/lib/openapi.server";
import {openApiPagesOptions} from "@/lib/openapi-pages";
import {renderOpenApiMarkdown} from "./render-openapi";
import type {LLMPage, OpenApiPageData, OpenApiRootSchema} from "./types";

export async function getLLMText(page: LLMPage) {
  if (isOpenAPIPage(page)) {
    return renderOpenApiMarkdown(page);
  }

  if (page.url.includes("/api/")) {
    const fallback = await renderOpenApiFallbackByUrl(page);
    if (fallback) return fallback;
  }

  if (typeof page.data.getText !== "function") {
    return `# ${page.data.title} (${page.url})`;
  }

  const processed = await page.data.getText("processed");
  if (isNotFoundPayload(processed)) {
    const fallback = await renderOpenApiFallbackByUrl(page);
    if (fallback) return fallback;
    return `# ${page.data.title} (${page.url})`;
  }

  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}

let openApiFallbackIndexPromise: Promise<Map<string, OpenApiPageData>> | undefined;

async function getOpenApiFallbackIndex() {
  if (!openApiFallbackIndexPromise) {
    openApiFallbackIndexPromise = (async () => {
      const result = await openapiSource(openapi, {
        ...openApiPagesOptions,
        baseDir: "api",
      });
      const map = new Map<string, OpenApiPageData>();

      for (const file of result.files) {
        if (file.type !== "page") continue;
        const normalizedPath = file.path.replace(/\.(mdx|md)$/u, "");
        map.set(`/${normalizedPath}`, file.data as OpenApiPageData);
      }

      return map;
    })();
  }

  return openApiFallbackIndexPromise;
}

async function renderOpenApiFallbackByUrl(page: LLMPage) {
  if (!page.url.includes("/api/")) return;

  const map = await getOpenApiFallbackIndex();
  const url = page.url.replace(/\/+$/u, "");
  const localizedUrl = url.startsWith("/api/") ? `/en${url}` : url;
  const deLocalizedUrl = url.replace(/^\/[a-z]{2}(?=\/api\/)/u, "");
  const fallbackData = map.get(url) ?? map.get(localizedUrl) ?? map.get(deLocalizedUrl);
  if (!fallbackData || typeof fallbackData.getOpenAPIPageProps !== "function" || typeof fallbackData.getSchema !== "function") return;

  return renderOpenApiMarkdown({
    ...page,
    data: {
      ...page.data,
      title: fallbackData.title ?? page.data.title,
      description: fallbackData.description ?? page.data.description,
      getOpenAPIPageProps: fallbackData.getOpenAPIPageProps,
      getSchema: fallbackData.getSchema,
    },
  });
}

function isNotFoundPayload(processed: string) {
  const compact = processed.trim().replace(/\s+/gu, "");
  return compact.includes('"isNotFound":true');
}

function isOpenAPIPage(page: LLMPage): page is LLMPage & {
  data: LLMPage["data"] & {
    getOpenAPIPageProps: () => Omit<OpenAPIPageProps, "document">;
    getSchema: () => OpenApiRootSchema;
  };
} {
  return (
    typeof page.data.getOpenAPIPageProps === "function" &&
    typeof page.data.getSchema === "function" &&
    (page.data.type === "openapi" || page.url.includes("/api/"))
  );
}
