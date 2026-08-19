import fs from "node:fs/promises";
import path from "node:path";
import {openapiSource} from "fumadocs-openapi/server";
import {openapi} from "../../src/lib/openapi.server.ts";
import {openApiPagesOptions} from "../../src/lib/openapi-pages.ts";

export interface DocsPrerenderPages {
  docs: string[];
  markdown: string[];
  og: string[];
  llmsFull: string[];
}

interface CollectDocsPrerenderPagesOptions {
  contentDir: string;
  supportedLanguages: readonly string[];
}

export async function collectDocsPrerenderPages({
  contentDir,
  supportedLanguages,
}: CollectDocsPrerenderPagesOptions): Promise<DocsPrerenderPages> {
  const supportedLanguageSet = new Set(supportedLanguages);
  const {docsPages, langs} = await collectDocsFromContentDir(contentDir, supportedLanguageSet);
  await collectOpenApiPages(docsPages, langs, supportedLanguageSet);
  const {ogPages, markdownPages} = buildDerivedPages(docsPages);
  const llmsFullPages = buildLlmsFullPages(langs);
  const sort = (value: Set<string>) => Array.from(value).sort((a, b) => a.localeCompare(b));
  return {
    docs: sort(docsPages),
    markdown: sort(markdownPages),
    og: sort(ogPages),
    llmsFull: sort(llmsFullPages),
  };
}

async function collectDocsFromContentDir(contentDir: string, supportedLanguageSet: Set<string>) {
  const docsPages = new Set<string>();
  const langs = new Set<string>();

  await walkDocs({
    dir: contentDir,
    contentDir,
    supportedLanguageSet,
    docsPages,
    langs,
  });

  return {docsPages, langs};
}

type WalkDocsOptions = {
  dir: string;
  contentDir: string;
  supportedLanguageSet: Set<string>;
  docsPages: Set<string>;
  langs: Set<string>;
};

async function walkDocs({dir, contentDir, supportedLanguageSet, docsPages, langs}: WalkDocsOptions) {
  const entries = await fs.readdir(dir, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkDocs({dir: fullPath, contentDir, supportedLanguageSet, docsPages, langs});
      continue;
    }

    if (!isDocEntry(entry)) continue;
    const routeInfo = getDocRouteInfo({contentDir, fullPath, supportedLanguageSet});
    if (!routeInfo) continue;

    langs.add(routeInfo.lang);
    docsPages.add(`/${routeInfo.lang}/${routeInfo.routeSegments.join("/")}`);
  }
}

function isDocEntry(entry: {isFile(): boolean; name: string}) {
  if (!entry.isFile()) return false;
  return entry.name.endsWith(".mdx") || entry.name.endsWith(".md");
}

type DocRouteInfo = {
  lang: string;
  routeSegments: string[];
};

function getDocRouteInfo({
  contentDir,
  fullPath,
  supportedLanguageSet,
}: {
  contentDir: string;
  fullPath: string;
  supportedLanguageSet: Set<string>;
}): DocRouteInfo | null {
  const relativePath = path.relative(contentDir, fullPath).replaceAll(path.sep, "/");
  const noExt = relativePath.replace(/\.(mdx|md)$/u, "");
  const [lang, ...segments] = noExt.split("/");
  if (!lang || !supportedLanguageSet.has(lang) || segments.length === 0) return null;

  const leaf = segments.at(-1);
  const routeSegments = leaf === "index" ? segments.slice(0, -1) : segments;
  if (routeSegments.length === 0) return null;

  return {lang, routeSegments};
}

function buildDerivedPages(docsPages: Set<string>) {
  const ogPages = new Set<string>();
  const markdownPages = new Set<string>();

  for (const pagePath of docsPages) {
    const [, lang, ...slugSegments] = pagePath.split("/");
    if (!lang || slugSegments.length === 0) continue;
    ogPages.add(`/${lang}/og/${slugSegments.join("/")}/image.png`);
    markdownPages.add(`${pagePath}.md`);
  }

  return {ogPages, markdownPages};
}

function buildLlmsFullPages(langs: Set<string>) {
  const llmsFullPages = new Set<string>();
  for (const lang of langs) {
    llmsFullPages.add(`/${lang}/llms-full.txt`);
  }
  return llmsFullPages;
}

async function collectOpenApiPages(docsPages: Set<string>, langs: Set<string>, supportedLanguageSet: Set<string>) {
  // Build once, then localize to every supported language path.
  const openApiPages = await openapiSource(openapi, {
    ...openApiPagesOptions,
    baseDir: "__lang__/api",
  });

  for (const file of openApiPages.files) {
    if (file.type !== "page") continue;
    const noExt = file.path.replace(/\.(mdx|md)$/u, "");

    for (const language of supportedLanguageSet) {
      const localized = noExt.replace(/^__lang__/u, language);
      langs.add(language);
      docsPages.add(`/${localized}`);
    }
  }
}

export function toStaticPages(paths: string[]) {
  return paths.map((pagePath) => ({path: pagePath}));
}

interface CreateOgPrerenderPagesOptions {
  ogPaths: string[];
  outputDir: string;
}

export function createOgPrerenderPages({ogPaths, outputDir}: CreateOgPrerenderPagesOptions) {
  return ogPaths.map((pagePath) => ({
    path: pagePath,
    prerender: {
      crawlLinks: false,
      headers: {
        "x-og-prerender": "base64",
      },
      onSuccess: async ({page, html}: {page: {path: string}; html: string}) => {
        const outputPath = path.join(outputDir, page.path.replace(/^\//, ""));
        await fs.mkdir(path.dirname(outputPath), {recursive: true});
        await fs.writeFile(outputPath, Buffer.from(html.trim(), "base64"));
      },
    },
  }));
}
