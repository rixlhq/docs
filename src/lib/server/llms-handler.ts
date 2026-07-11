import {notFound} from "@tanstack/react-router";
import {source} from "@/lib/source.server";
import {getLLMText} from "@/lib/get-llm-text/index.server";
import type {LLMPage} from "@/lib/get-llm-text/types";

function isSupportedPage(page: unknown): page is LLMPage {
  if (!page || typeof page !== "object") return false;
  const data = (page as {data?: LLMPage["data"]}).data;
  if (!data || typeof data !== "object") return false;

  return typeof data.getText === "function" || (typeof data.getAPIPageProps === "function" && typeof data.getSchema === "function");
}

export const llmsHandler = async ({params}: {params: {lang: string; _splat?: string}}) => {
  const slugs = params._splat?.split("/") ?? [];
  const page = source.getPage(slugs, params.lang);
  if (!page || !isSupportedPage(page)) throw notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
};
