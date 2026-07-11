import {DocsLayout} from "fumadocs-ui/layouts/docs";
import type {DocsLayoutProps} from "fumadocs-ui/layouts/docs";
import {HomeLayout} from "fumadocs-ui/layouts/home";
import {ReactNode} from "react";
import {baseOptions} from "@/lib/layout.shared";
import type {Root} from "fumadocs-core/page-tree";
import {Background} from "@/components/layout/home/background";

interface LayoutProps {
  lang: string;
  searchToggle?: boolean;
  sidebar?: boolean;
  isApiPage?: boolean;
  children: ReactNode;
  dataTree: object;
  sectionLinks?: {
    home: string;
    sdk: string;
    api: string;
  };
  treeKey?: string;
}

type LayoutWidthClasses = {
  layoutWidthClass: string;
  docsLayoutWidthClass: string;
};

type DocsLayoutPropsConfig = {
  tree: Root;
  options: ReturnType<typeof baseOptions>;
  docsLayoutWidthClass: string;
  searchToggle: boolean;
  sidebar: boolean;
};

function getLayoutWidthClasses(isApiPage: boolean): LayoutWidthClasses {
  return {
    layoutWidthClass: isApiPage ? "xl:[--fd-layout-width:2200px]" : "xl:[--fd-layout-width:1760px]",
    docsLayoutWidthClass: isApiPage ? "xl:layout:[--fd-layout-width:2200px]" : "xl:layout:[--fd-layout-width:1760px]",
  };
}

function buildDocsLayoutProps({tree, options, docsLayoutWidthClass, searchToggle, sidebar}: DocsLayoutPropsConfig): DocsLayoutProps {
  return {
    tree,
    ...options,
    containerProps: {
      className: docsLayoutWidthClass,
    },
    nav: {
      ...options.nav,
      enabled: false,
      title: null,
      children: null,
    },
    searchToggle: {
      enabled: searchToggle,
    },
    themeSwitch: {
      enabled: false,
    },
    tabs: false,
    sidebar: {
      enabled: sidebar,
      footer: null,
      collapsible: false,
    },
  };
}

export default function SharedLayout({
  lang,
  searchToggle = true,
  sidebar = true,
  isApiPage = false,
  dataTree,
  sectionLinks,
  treeKey,
  children,
}: LayoutProps) {
  const tree = dataTree as Root;
  const options = baseOptions(lang, sectionLinks);
  const {layoutWidthClass, docsLayoutWidthClass} = getLayoutWidthClasses(isApiPage);
  const docsLayoutProps = buildDocsLayoutProps({
    tree,
    options,
    docsLayoutWidthClass,
    searchToggle,
    sidebar,
  });

  return (
    <div className="relative z-10 flex min-h-svh flex-col">
      <Background />
      <HomeLayout
        {...options}
        searchToggle={{
          enabled: false,
        }}
        className={`flex-1 ${layoutWidthClass}`}
      >
        <DocsLayout key={treeKey} {...docsLayoutProps}>
          {children}
        </DocsLayout>
      </HomeLayout>
    </div>
  );
}
