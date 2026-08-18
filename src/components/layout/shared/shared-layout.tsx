"use client";

import {DocsLayout} from "fumadocs-ui/layouts/docs";
import {HomeLayout} from "fumadocs-ui/layouts/home";
import {ReactNode, useMemo, useState} from "react";
import {usePathname} from "fumadocs-core/framework";
import {baseOptions} from "@/lib/layout.shared";
import type {Root, Node, Folder, Item, Separator} from "fumadocs-core/page-tree";
import {Background} from "@/components/layout/home/background";
import {SidebarBanner} from "./sidebar-banner";

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
  filter: string;
  setFilter: (value: string) => void;
  lang: string;
};

function getLayoutWidthClasses(isApiPage: boolean): LayoutWidthClasses {
  return {
    layoutWidthClass: isApiPage ? "xl:[--fd-layout-width:2200px]" : "xl:[--fd-layout-width:1760px]",
    docsLayoutWidthClass: isApiPage ? "xl:layout:[--fd-layout-width:2200px]" : "xl:layout:[--fd-layout-width:1760px]",
  };
}

function getNodeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(getNodeText).join("");

  if (typeof value === "object") {
    const props = (value as Record<string, unknown>).props;
    if (props && typeof props === "object") {
      return getNodeText((props as Record<string, unknown>).children);
    }
  }

  return "";
}

interface FilterResult {
  node?: Node;
  matches: boolean;
  onPath: boolean;
}

function nodeMatchesQuery(node: Item | Folder | Separator, query: string): boolean {
  const text = [getNodeText(node.name), getNodeText(node.description)]
    .join(" ")
    .toLowerCase();

  return text.includes(query);
}

function filterPageNode(node: Item, query: string, pathname: string): FilterResult {
  const onPath = node.url === pathname;
  const matches = onPath || nodeMatchesQuery(node, query);

  return matches ? {node: {...node}, matches, onPath} : {matches: false, onPath: false};
}

function filterFolderNode(node: Folder, query: string, pathname: string): FilterResult {
  const childResults = node.children.map((child) => filterNode(child, query, pathname));
  const hasActiveChild = childResults.some((result) => result.onPath);
  const hasMatchingChild = childResults.some((result) => result.matches);
  const isActive = node.index?.url === pathname;
  const isMatching = nodeMatchesQuery(node, query);

  if (!hasActiveChild && !isActive && !hasMatchingChild && !isMatching) {
    return {matches: false, onPath: false};
  }

  const filteredChildren = childResults
    .filter((result) => result.onPath || result.matches)
    .map((result) => result.node as Node);

  return {
    node: {...node, children: filteredChildren},
    matches: true,
    onPath: hasActiveChild || isActive,
  };
}

function filterNode(node: Node, query: string, pathname: string): FilterResult {
  if (node.type === "separator") {
    return {node: {...node}, matches: nodeMatchesQuery(node, query), onPath: false};
  }

  if (node.type === "page") {
    return filterPageNode(node, query, pathname);
  }

  return filterFolderNode(node, query, pathname);
}

function filterTree(root: Root, query: string, pathname: string): Root {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return root;

  const filteredChildren = root.children
    .map((child) => filterNode(child, trimmed, pathname))
    .filter((result) => result.onPath || result.matches)
    .map((result) => result.node as Node);

  const filteredRoot: Root = {...root, children: filteredChildren};
  filteredRoot.$id = `${root.$id ?? "root"}-filter-${trimmed}`;

  return filteredRoot;
}

function buildDocsLayoutProps({
  tree,
  options,
  docsLayoutWidthClass,
  searchToggle,
  sidebar,
  filter,
  setFilter,
  lang,
}: DocsLayoutPropsConfig) {
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
    tabs: false as const,
    sidebar: {
      enabled: sidebar,
      footer: null,
      collapsible: false,
      banner: <SidebarBanner filter={filter} onFilterChange={setFilter} lang={lang} />,
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
  const [filter, setFilter] = useState("");
  const pathname = usePathname() ?? "";
  const filteredTree = useMemo(() => filterTree(tree, filter, pathname), [tree, filter, pathname]);
  const options = baseOptions(lang, sectionLinks);
  const {layoutWidthClass, docsLayoutWidthClass} = getLayoutWidthClasses(isApiPage);
  const docsLayoutProps = buildDocsLayoutProps({
    tree: filteredTree,
    options,
    docsLayoutWidthClass,
    searchToggle,
    sidebar,
    filter,
    setFilter,
    lang,
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
