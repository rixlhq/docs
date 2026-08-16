import {createFileRoute} from "@tanstack/react-router";
import type {TOCItemType} from "fumadocs-core/toc";
import {getPageImage} from "@/lib/images";
import {DocsBody, DocsDescription, DocsPage, DocsTitle} from "fumadocs-ui/page";
import browserCollections from "fumadocs-mdx:collections/browser";
import SharedLayout from "@/components/layout/shared/shared-layout";
import {getMDXComponents} from "@/components/mdx-components";
import {Footer} from "@/components/layout/footer/footer";
import {LLMCopyButton} from "@/components/page-actions/llm-copy-button";
import {loader} from "@/lib/server/docs-loader";
import {Suspense} from "react";
import {useFumadocsLoader} from "fumadocs-core/source/client";
import {StaticApiHtml} from "@/components/mdx/static-api-html";
import {TableOfContents, TableOfContentsPopover} from "@/components/mdx/toc";
import {Pagination} from "@/components/mdx/pagination";

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
  head: ({loaderData: _loaderData}) => {
    if (!_loaderData) return {};
    const {page} = _loaderData;
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

interface StaticOpenApiPage {
  html: string;
}

const clientLoader = browserCollections.docs.createClientLoader<{}>({
  component: DocsContent,
});

function Page() {
  const {lang, _splat} = Route.useParams();
  const loaderData = Route.useLoaderData() as {
    tree: unknown;
    sectionLinks: {
      home: string;
      sdk: string;
      api: string;
    };
    path: string;
    page: {
      slugs: string[];
      locale: string;
      data: {
        title: string;
        description: string;
      };
    };
    apiPage?: StaticOpenApiPage;
  };
  const data = useFumadocsLoader(loaderData) as {tree: object};
  const isApiPage = !!loaderData.apiPage;
  const Content = isApiPage ? undefined : clientLoader.getComponent(loaderData.path);
  const section = _splat?.split("/")[0] ?? "root";

  return (
    <SharedLayout
      lang={lang}
      dataTree={data.tree}
      sectionLinks={loaderData.sectionLinks}
      treeKey={`${lang}:${section}`}
      isApiPage={isApiPage}
    >
      {isApiPage ? <ApiContent apiPage={loaderData.apiPage} page={loaderData.page} /> : Content ? <Content /> : null}
    </SharedLayout>
  );
}

function ApiContent({
  apiPage,
  page,
}: {
  apiPage?: StaticOpenApiPage;
  page: {
    slugs: string[];
    locale: string;
    data: {
      title: string;
      description: string;
    };
  };
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
  const markdownPath = pageSlug ? `/${lang}/${pageSlug}.md` : `/${lang}.md`;
  const githubPath = pageSlug ? `content/${lang}/${pageSlug}` : `content/${lang}`;

  return (
    <>
      <DocsPage
        className="pt-6 md:pt-8 xl:pt-10 md:px-7 xl:px-10"
        full={false}
        toc={toc}
        tableOfContent={{component: <TableOfContents />}}
        tableOfContentPopover={{component: <TableOfContentsPopover />}}
        footer={{
          component: (
            <>
              <Pagination />
              <Footer lang={lang} />
            </>
          ),
        }}
      >
        <header className="relative space-y-2">
          <div className="flex items-center justify-between gap-2">
            <DocsTitle>{frontmatter.title}</DocsTitle>
            <LLMCopyButton markdownUrl={markdownPath} githubUrl={`https://github.com/qeeqez/docs/tree/main/${githubPath}`} />
          </div>
          <DocsDescription>{frontmatter.description}</DocsDescription>
        </header>
        <DocsBody>
          <Suspense fallback={null}>
            <MDX
              components={getMDXComponents({
                // a: createRelativeLink(source, page), TODO keke
              })}
            />
          </Suspense>
        </DocsBody>
      </DocsPage>
    </>
  );
}
