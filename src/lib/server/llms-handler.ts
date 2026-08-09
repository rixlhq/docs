import {source} from "@/lib/source.server";
import {notFound} from "@tanstack/react-router";

export const llmsHandler = async ({params}: {params: {lang: string; _splat?: string}}) => {
  const slugs = params._splat?.split("/") ?? [];
  const page = source.getPage(slugs, params.lang);
  if (!page) throw notFound();

  const {getText} = page.data as {getText?: (format: "raw") => Promise<string>};
  if (typeof getText !== "function") throw notFound();

  return new Response(await getText("raw"), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
};
