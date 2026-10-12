import {source} from "@/lib/source.server";

const localeLoaders = new Map<string, object>();

async function getLocaleLoader(locale: string): Promise<object> {
  const cached = localeLoaders.get(locale);
  if (cached) return cached;
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

/**
 * Builds the static search index for one locale and returns the exact bytes
 * served by the `/api/search/$locale` endpoint. Shared by the route handler
 * (dev) and the build-time plugin, which writes the files directly so
 * prerendering never has to build these multi-megabyte indexes inside the
 * preview server.
 */
export async function buildSearchIndex(locale: string): Promise<string> {
  const {createFromSource} = await import("fumadocs-core/search/server");
  const loader = await getLocaleLoader(locale);
  const server = createFromSource(loader as never, {
    language: locale === "de" ? "german" : "english",
  });
  const response = await server.staticGET();
  return response.text();
}
