import {createFileRoute} from "@tanstack/react-router";
import type {TOCItemType} from "fumadocs-core/toc";
import {useFumadocsLoader} from "fumadocs-core/source/client";
import browserCollections from "fumadocs-mdx:collections/browser";
import React, {Suspense} from "react";
import SharedLayout from "@/components/layout/shared/shared-layout";
import {Footer} from "@/components/layout/footer/footer";
import {StaticApiHtml} from "@/components/mdx/static-api-html";
import {getMDXComponents} from "@/components/mdx-components";
import {LLMCopyButton} from "@/components/page-actions/llm-copy-button";
import {getPageImage} from "@/lib/images";
import {loader, type DocsLoaderData} from "@/lib/server/docs-loader";
import {DocsBody, DocsDescription, DocsPage, DocsTitle} from "fumadocs-ui/page";

export const Route = createFileRoute("/$lang/$")({
  component: Page,
  loader: async ({params}) => {
    const splat = params._splat ?? "";
    const slugs = splat ? splat.split("/") : [];
    const data = await loader({data: {slugs, lang: params.lang}});
    if (slugs[0] !== "api") {
      void clientLoader.preload(data.path);
    }
    return data;
  },
  head: ({loaderData}) => {
    if (!loaderData) return {};
    const {page} = loaderData;
    const appName = "Rixl";
    const imageUrl = getPageImage(page.slugs, page.locale).url;

    return {
      meta: [
        {title: `${page.data.title} - ${appName}`},
        {name: "description", content: page.data.description},
        {name: "application-name", content: appName},
        {property: "og:title", content: page.data.title},
        {property: "og:description", content: page.data.description},
        {property: "og:image", content: imageUrl},
        {property: "og:site_name", content: appName},
        {name: "twitter:card", content: "summary_large_image"},
        {name: "twitter:title", content: page.data.title},
        {name: "twitter:description", content: page.data.description},
        {name: "twitter:image", content: imageUrl},
      ],
    };
  },
});

interface LoadedDoc {
  toc: TOCItemType[];
  frontmatter: {
    title?: string;
    description?: string;
  };
  default: React.ComponentType<{
    components?: ReturnType<typeof getMDXComponents>;
  }>;
}

const clientLoader = browserCollections.docs.createClientLoader({
  component: DocsContent,
});

function Page() {
  const {lang, _splat} = Route.useParams();
  const loaderData = Route.useLoaderData();
  const data = useFumadocsLoader(loaderData) as {tree: object};
  const isApiPage = Boolean(loaderData.apiPage);
  const Content = isApiPage ? null : (clientLoader.getComponent(loaderData.path) as (() => React.ReactElement) | null);
  const section = _splat?.split("/")[0] ?? "root";

  return (
    <SharedLayout
      lang={lang}
      dataTree={data.tree}
      sectionLinks={loaderData.sectionLinks}
      treeKey={`${lang}:${section}`}
      isApiPage={isApiPage}
    >
      {isApiPage && loaderData.apiPage ? <ApiContent apiPage={loaderData.apiPage} page={loaderData.page} /> : Content ? <Content /> : null}
    </SharedLayout>
  );
}

function ApiContent({
  apiPage,
  page,
}: {
  apiPage?: DocsLoaderData["apiPage"];
  page: DocsLoaderData["page"];
}) {
  const {lang, _splat} = Route.useParams();
  if (!apiPage) return null;
  const pageSlug = _splat ?? "";
  const markdownPath = pageSlug ? `/${lang}/${pageSlug}.md` : `/${lang}.md`;
  const githubPath = pageSlug ? `content/${lang}/${pageSlug}` : `content/${lang}`;

  return (
    <DocsPage
      className="api-docs-page max-w-[1880px] pt-3 md:pt-4 xl:pt-5 md:px-6 xl:px-8"
      full={false}
      toc={[]}
      tableOfContent={{
        enabled: false,
      }}
      footer={{
        children: <Footer lang={lang} />,
      }}
    >
      <header className="relative">
        <div className="flex items-center justify-between gap-2">
          <DocsTitle>{page.data.title}</DocsTitle>
          <LLMCopyButton markdownUrl={markdownPath} githubUrl={`https://github.com/qeeqez/docs/tree/main/${githubPath}`} />
        </div>
      </header>
      <DocsBody className="max-w-none">
        <StaticApiHtml html={apiPage.html} />
      </DocsBody>
    </DocsPage>
  );
}

function DocsContent({toc, frontmatter, default: MDX}: LoadedDoc) {
  const {lang, _splat} = Route.useParams();
  const pageSlug = _splat ?? "";
  const category = getCategoryFromSlug(pageSlug);
  const markdownPath = pageSlug ? `/${lang}/${pageSlug}.md` : `/${lang}.md`;
  const githubPath = pageSlug ? `content/${lang}/${pageSlug}` : `content/${lang}`;

  return (
    <DocsPage
      className="pt-6 md:pt-8 xl:pt-10 md:px-7 xl:px-10"
      full={false}
      toc={toc}
      footer={{
        children: <Footer lang={lang} />,
      }}
    >
      <header className="relative space-y-2">
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-fd-primary">{category}</p>

          <div className="flex items-center justify-between gap-2">
            <DocsTitle>{frontmatter.title}</DocsTitle>
            <LLMCopyButton markdownUrl={markdownPath} githubUrl={`https://github.com/qeeqez/docs/tree/main/${githubPath}`} />
          </div>
        </div>
        <DocsDescription>{frontmatter.description}</DocsDescription>
      </header>
      <DocsBody>
        <Suspense fallback={null}>
          <MDX components={getMDXComponents({})} />
        </Suspense>
      </DocsBody>
    </DocsPage>
  );
}

function getCategoryFromSlug(pageSlug: string): string {
  const segments = pageSlug.split("/").filter(Boolean);
  const category = segments[1] ?? segments[0] ?? "Documentation";

  return category
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}
