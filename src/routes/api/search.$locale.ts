import {createFileRoute} from "@tanstack/react-router";

const localeLoaders = new Map<string, object>();

async function getLocaleLoader(locale: string): Promise<object> {
  const cached = localeLoaders.get(locale);
  if (cached) return cached;
  const {source} = await import("@/lib/source.server");
  // Narrow the source to a single locale. `createFromSource` only reads
  // `getPages`/`getPageTree`/`_i18n` from the loader, so a thin delegate
  // suffices; omitting `_i18n` selects the plain (non-i18n) export shape,
  // i.e. one self-contained index containing only this locale's documents.
  const filtered = {
    getPages: () => source.getPages().filter((page) => page.locale === locale),
    getPageTree: (treeLocale?: string) => source.getPageTree(treeLocale ?? locale),
  };
  localeLoaders.set(locale, filtered);
  return filtered;
}

export const Route = createFileRoute("/api/search/$locale")({
  server: {
    handlers: {
      GET: async ({params}) => {
        const [{createFromSource}, {i18n}] = await Promise.all([import("fumadocs-core/search/server"), import("@/lib/i18n")]);
        if (!(i18n.languages as readonly string[]).includes(params.locale)) {
          return new Response("Not found", {status: 404});
        }
        const loader = await getLocaleLoader(params.locale);
        const server = createFromSource(loader as never, {
          language: params.locale === "de" ? "german" : "english",
        });
        return server.staticGET();
      },
    },
  },
});
