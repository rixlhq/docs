import {createFileRoute, notFound} from "@tanstack/react-router";

type OpenApiData = {
  getOpenAPIPageProps?: unknown;
  getSchema?: unknown;
};

type LLMPage = {
  data?: {
    getText?: unknown;
  } & OpenApiData;
};

function hasMarkdownText(page: LLMPage | undefined): boolean {
  return typeof page?.data?.getText === "function";
}

function hasOpenApiData(page: LLMPage | undefined): boolean {
  const data = page?.data;
  return typeof data?.getOpenAPIPageProps === "function" && typeof data?.getSchema === "function";
}

function isSupportedPage(page: LLMPage | undefined): boolean {
  return hasMarkdownText(page) || hasOpenApiData(page);
}

function buildMarkdownResponse(content: string): Response {
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export const Route = createFileRoute("/$lang/{$}.md")({
  server: {
    handlers: {
      GET: async ({params}) => {
        const [{getLLMText}, {source}] = await Promise.all([import("@/lib/get-llm-text/index.server"), import("@/lib/source.server")]);
        const splat = params._splat ?? "";
        const slugs = splat ? splat.split("/") : [];
        const page = source.getPage(slugs, params.lang);
        if (!page || !isSupportedPage(page as LLMPage | undefined)) throw notFound();

        const content = await getLLMText(page as Parameters<typeof getLLMText>[0]);
        return buildMarkdownResponse(content);
      },
    },
  },
});
