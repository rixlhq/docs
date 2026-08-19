import {notFound} from "@tanstack/react-router";
import {createServerFn} from "@tanstack/react-start";
import {staticFunctionMiddleware} from "@tanstack/start-static-server-functions";
import type {Folder, Node, Root} from "fumadocs-core/page-tree";
import {renderToReadableStream} from "react-dom/server";
import {createElement} from "react";
import type {OpenAPIPageProps_Spec} from "fumadocs-openapi/ui";
import {source} from "../../lib/source.server";
import {APIPage} from "../../components/mdx/api-page.server";

export const loader = createServerFn({
  method: "GET",
})
  .validator((params: {slugs: string[]; lang?: string}) => params)
  .middleware([staticFunctionMiddleware]) // used for tanstack static rendering
  .handler(async ({data: {slugs, lang}}) => {
    const page = source.getPage(slugs, lang);
    if (!page) throw notFound();

    const tree = source.getPageTree(lang) as Root;
    const sectionLinks = getSectionLinks(tree, page.locale ?? "");
    const {tree: normalizedTree, backUrl, treeKey} = lang ? extractProductTree(tree, lang, slugs) : {tree, backUrl: undefined, treeKey: lang};
    const apiPage = getApiPage(page.data);
    const apiPageHtml = apiPage ? await renderApiPageHtml(apiPage) : undefined;

    return {
      tree: await source.serializePageTree(normalizedTree),
      sectionLinks,
      backUrl,
      treeKey,
      path: page.path,
      page: {
        slugs: page.slugs,
        locale: page.locale,
        data: {
          title: page.data.title,
          description: page.data.description,
        },
      },
      apiPage: apiPage
        ? {
            html: apiPageHtml ?? "",
          }
        : undefined,
    };
  });

// Resolves the splat for the first API page (e.g. "api/analytics/get-analytics-v1-dashboard").
// Used by the /$lang/api index redirect so the landing page tracks the spec instead of a
// hardcoded operation slug that breaks whenever the OpenAPI spec changes.
export const getApiEntrySlug = createServerFn({
  method: "GET",
})
  .validator((params: {lang?: string}) => params)
  .middleware([staticFunctionMiddleware])
  .handler(({data: {lang}}) => {
    const tree = source.getPageTree(lang) as Root;
    const url = findFirstPageUrlByPrefix(tree, `/${lang}/api`);
    if (!url) return "api";

    const prefix = `/${lang}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : url.replace(/^\/+/, "");
  });

interface StaticOpenApiPage {
  props: OpenAPIPageProps_Spec;
}

async function renderApiPageHtml(apiPage: StaticOpenApiPage): Promise<string> {
  const stream = await renderToReadableStream(createElement(APIPage, apiPage.props));
  await stream.allReady;
  return await new Response(stream).text();
}

function getApiPage(data: unknown): StaticOpenApiPage | undefined {
  if (!isOpenApiData(data)) return;

  return {
    props: data.getOpenAPIPageProps(),
  };
}

function isOpenApiData(data: unknown): data is {
  getOpenAPIPageProps: () => OpenAPIPageProps_Spec;
} {
  return typeof data === "object" && data !== null && "getOpenAPIPageProps" in data && typeof data.getOpenAPIPageProps === "function";
}

function getSectionLinks(tree: Root, lang: string) {
  const fallback = {
    home: `/${lang}/home/getting-started/overview`,
    sdk: `/${lang}/sdk`,
    api: `/${lang}/api`,
  };

  return {
    home: findFirstPageUrlByPrefix(tree, `/${lang}/home`) ?? fallback.home,
    sdk: findFirstPageUrlByPrefix(tree, `/${lang}/sdk`) ?? fallback.sdk,
    api: findFirstPageUrlByPrefix(tree, `/${lang}/api`) ?? fallback.api,
  };
}

function findFirstPageUrlByPrefix(root: Root, prefix: string): string | undefined {
  for (const node of root.children) {
    const match = findFirstNodePageUrlByPrefix(node, prefix);
    if (match) return match;
  }
}

function findFirstNodePageUrlByPrefix(node: Node, prefix: string): string | undefined {
  if (node.type === "page") return node.url.startsWith(prefix) ? node.url : undefined;
  if (node.type !== "folder") return;

  for (const child of node.children) {
    const match = findFirstNodePageUrlByPrefix(child, prefix);
    if (match) return match;
  }
}

function extractSectionTree(root: Root, lang: string, section: string | undefined): Root {
  if (!section) return root;

  const prefix = `/${lang}/${section}`;
  const sectionFolder = root.children.find((item): item is Folder => item.type === "folder" && hasPrefixInNode(item, prefix));
  if (!sectionFolder) return root;

  // API pages are generated from the OpenAPI spec and should stay flat.
  if (section === "api") {
    return {
      ...root,
      children: sectionFolder.children,
    };
  }

  // Keep the section folder itself in the tree so it can act as a product root.
  // Nested roots (e.g. media-react under sdk) are then picked by TreeContextProvider.
  return {
    ...root,
    children: [sectionFolder],
  };
}

function hasPrefixInNode(node: Node, prefix: string): boolean {
  if (node.type === "page") return node.url.startsWith(prefix);
  if (node.type !== "folder") return false;

  if (node.index?.url.startsWith(prefix)) return true;
  return node.children.some((item) => hasPrefixInNode(item, prefix));
}

interface ProductTreeResult {
  tree: Root;
  backUrl?: string;
  treeKey: string;
}

function extractProductTree(root: Root, lang: string, slugs: string[]): ProductTreeResult {
  const section = slugs[0];
  if (!section) return {tree: root, treeKey: lang};

  if (section === "api") {
    return {tree: extractSectionTree(root, lang, section), treeKey: `${lang}:api`};
  }

  const product = slugs[1];
  const sectionPrefix = `/${lang}/${section}`;
  const sectionFolder = root.children.find((item): item is Folder =>
    item.type === "folder" ? hasPrefixInNode(item, sectionPrefix) : false
  );

  if (!sectionFolder) return {tree: extractSectionTree(root, lang, section), treeKey: `${lang}:${section}`};

  if (!product) {
    return {tree: extractSectionTree(root, lang, section), treeKey: `${lang}:${section}`};
  }

  const productPrefix = `/${lang}/${section}/${product}`;
  const productFolder = findFolderByPrefix(sectionFolder, productPrefix);

  if (!productFolder) {
    return {tree: extractSectionTree(root, lang, section), backUrl: `${sectionPrefix}/`, treeKey: `${lang}:${section}`};
  }

  const productRoot: Root = {
    ...root,
    name: productFolder.name,
    description: productFolder.description,
    children: productFolder.children,
    type: "root",
  };

  return {
    tree: productRoot,
    backUrl: `${sectionPrefix}/`,
    treeKey: `${lang}:${section}:${product}`,
  };
}

function findFolderByPrefix(node: Node, prefix: string): Folder | undefined {
  if (node.type === "folder") {
    if (node.index?.url.startsWith(prefix)) return node;
    for (const child of node.children) {
      const match = findFolderByPrefix(child, prefix);
      if (match) return match;
    }
  }
  return undefined;
}
