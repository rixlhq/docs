import {createFileRoute} from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/llms-full.txt")({
  server: {
    handlers: {
      GET: async ({params}) => {
        const [{getLLMText}, {source}] = await Promise.all([import("@/lib/get-llm-text/index.server"), import("@/lib/source.server")]);
        const scan = source
          .getPages()
          .filter((page) => {
            if (page.locale !== params.lang) return false;

            const hasMarkdownText = typeof (page.data as {getText?: unknown}).getText === "function";
            const hasOpenApiData =
              typeof (page.data as {getAPIPageProps?: unknown}).getAPIPageProps === "function" &&
              typeof (page.data as {getSchema?: unknown}).getSchema === "function";

            return hasMarkdownText || hasOpenApiData;
          })
          .map((page) => getLLMText(page as Parameters<typeof getLLMText>[0]));
        const scanned = await Promise.all(scan);
        return new Response(scanned.join("\n\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },
  },
});
