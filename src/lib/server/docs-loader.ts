import {notFound} from "@tanstack/react-router";
import {createServerFn} from "@tanstack/react-start";
import {staticFunctionMiddleware} from "@tanstack/start-static-server-functions";
import type {Folder, Node, Root} from "fumadocs-core/page-tree";
import type {SerializedPageTree} from "fumadocs-core/source/client";
import {createElement} from "react";
import {renderToReadableStream} from "react-dom/server";
import type {OpenAPIPageProps_Spec} from "fumadocs-openapi/ui";
import {APIPage} from "../../components/mdx/api-page.server";
import {source} from "../../lib/source.server";

export interface DocsSectionLinks {
  home: string;
  sdk: string;
  api: string;
}

export interface DocsPageSummary {
  slugs: string[];
  locale: string;
  data: {
    title: string;
    description: string;
  };
}

export interface StaticOpenApiPage {
  html: string;
}

export interface DocsLoaderData {
  tree: SerializedPageTree;
  sectionLinks: DocsSectionLinks;
  path: string;
  page: DocsPageSummary;
  apiPage?: StaticOpenApiPage;
}

export const loader = createServerFn({
  method: "GET",
})
  .validator((params: {slugs: string[]; lang?: string}) => params)
  .middleware([staticFunctionMiddleware])
  .handler(async ({data: {slugs, lang}}): Promise<DocsLoaderData> => {
    const page = source.getPage(slugs, lang);
    if (!page) throw notFound();

    const locale = page.locale ?? lang ?? "en";
    const tree = source.getPageTree(lang) as Root;
    const sectionLinks = getSectionLinks(tree, locale);
    const normalizedTree = slugs[0] === "api" ? extractApiTree(tree, locale) : tree;
    const apiPage = getApiPage(page.data);
    const apiPageHtml = apiPage ? await renderApiPageHtml(apiPage) : undefined;

    return {
      tree: await source.serializePageTree(normalizedTree),
      sectionLinks,
      path: page.path,
      page: {
        slugs: page.slugs,
        locale,
        data: {
          title: page.data.title ?? "Untitled",
          description: page.data.description ?? "",
        },
      },
      apiPage: apiPageHtml
        ? {
            html: apiPageHtml,
          }
        : undefined,
    };
  });

export const getApiEntrySlug = createServerFn({
  method: "GET",
})
  .validator((params: {lang?: string}) => params)
  .middleware([staticFunctionMiddleware])
  .handler(({data: {lang}}) => {
    const locale = lang ?? "en";
    const tree = source.getPageTree(lang) as Root;
    const url = findFirstPageUrlByPrefix(tree, `/${locale}/api`);
    if (!url) return "api";

    const prefix = `/${locale}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : url.replace(/^\/+/, "");
  });

interface RenderableOpenApiPage {
  props: OpenAPIPageProps_Spec;
}

async function renderApiPageHtml(apiPage: RenderableOpenApiPage): Promise<string> {
  const stream = await renderToReadableStream(createElement(APIPage, apiPage.props));
  await stream.allReady;
  return await new Response(stream).text();
}

function getApiPage(data: unknown): RenderableOpenApiPage | undefined {
  if (!isOpenApiData(data)) return undefined;

  return {
    props: data.getOpenAPIPageProps(),
  };
}

function isOpenApiData(data: unknown): data is {
  getOpenAPIPageProps: () => OpenAPIPageProps_Spec;
} {
  return typeof data === "object" && data !== null && "getOpenAPIPageProps" in data && typeof data.getOpenAPIPageProps === "function";
}

function getSectionLinks(tree: Root, lang: string): DocsSectionLinks {
  const fallback = {
    home: `/${lang}/home/getting-started/overview`,
    sdk: `/${lang}/sdk/getting-started/overview`,
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

  return undefined;
}

function findFirstNodePageUrlByPrefix(node: Node, prefix: string): string | undefined {
  if (node.type === "page") return node.url.startsWith(prefix) ? node.url : undefined;
  if (node.type !== "folder") return undefined;

  for (const child of node.children) {
    const match = findFirstNodePageUrlByPrefix(child, prefix);
    if (match) return match;
  }

  return undefined;
}

function extractApiTree(root: Root, lang: string): Root {
  const apiPrefix = `/${lang}/api`;
  const apiFolder = root.children.find((item): item is Folder => item.type === "folder" && hasPrefixInNode(item, apiPrefix));
  if (!apiFolder) return root;

  return {
    ...root,
    children: apiFolder.children,
  };
}

function hasPrefixInNode(node: Node, prefix: string): boolean {
  if (node.type === "page") return node.url.startsWith(prefix);
  if (node.type !== "folder") return false;

  if (node.index?.url.startsWith(prefix)) return true;
  return node.children.some((item) => hasPrefixInNode(item, prefix));
}
