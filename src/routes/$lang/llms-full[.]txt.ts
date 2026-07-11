import {createFileRoute} from "@tanstack/react-router";
import type {LLMPage} from "@/lib/get-llm-text/types";

function isSupportedPage(page: unknown): page is LLMPage & {locale?: string} {
  if (!page || typeof page !== "object") return false;
  const data = (page as {data?: LLMPage["data"]}).data;
  if (!data || typeof data !== "object") return false;

  return typeof data.getText === "function" || (typeof data.getAPIPageProps === "function" && typeof data.getSchema === "function");
}

export const Route = createFileRoute("/$lang/llms-full.txt")({
  server: {
    handlers: {
      GET: async ({params}) => {
        const [{getLLMText}, {source}] = await Promise.all([import("@/lib/get-llm-text/index.server"), import("@/lib/source.server")]);
        const scan = source
          .getPages()
          .filter((page) => page.locale === params.lang && isSupportedPage(page))
          .map((page) => getLLMText(page));
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
