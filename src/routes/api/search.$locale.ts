import {createFileRoute} from "@tanstack/react-router";
import {buildSearchIndex} from "@/lib/server/search-index.server";

export const Route = createFileRoute("/api/search/$locale")({
  server: {
    handlers: {
      GET: async ({params}) => {
        const {i18n} = await import("@/lib/i18n");
        if (!(i18n.languages as readonly string[]).includes(params.locale)) {
          return new Response("Not found", {status: 404});
        }
        // Same bytes prerendering writes to dist (the en/de index builds are
        // staggered in vite.config.ts so they never run concurrently).
        const json = await buildSearchIndex(params.locale);
        return new Response(json, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
