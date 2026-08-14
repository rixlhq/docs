import type {Folder, Node, Root} from "fumadocs-core/page-tree";
import type {LayoutTab} from "fumadocs-ui/layouts/shared";
import {jsx} from "react/jsx-runtime";

function getRootRedirectUrl(node: Folder): string | undefined {
  if (node.index?.url) return node.index.url;

  for (const child of node.children) {
    if (child.type === "page") return child.url;
  }

  return undefined;
}

function collectPageUrls(node: Node, urls: Set<string>): void {
  if (node.type === "page") {
    urls.add(node.url);
  } else if (node.type === "folder") {
    if (node.index?.url) urls.add(node.index.url);
    for (const child of node.children) collectPageUrls(child, urls);
  }
}

function folderToTab(node: Folder): LayoutTab | null {
  const url = getRootRedirectUrl(node);
  if (!url) return null;

  const urls = new Set<string>();
  collectPageUrls(node, urls);

  return {
    url,
    urls,
    title: node.name,
    description: node.description,
    icon: node.icon
      ? jsx("div", {
          className: "size-full [&_svg]:size-full max-md:p-1.5 max-md:rounded-md max-md:bg-fd-secondary",
          children: node.icon,
        })
      : undefined,
  };
}

function collectTabs(nodes: Node[], tabs: LayoutTab[]): void {
  for (const node of nodes) {
    if (node.type !== "folder") continue;

    if (node.root) {
      const tab = folderToTab(node);
      if (tab) tabs.push(tab);
    }

    collectTabs(node.children, tabs);
  }
}

export function getScopedTabs(tree: Root): LayoutTab[] {
  const tabs: LayoutTab[] = [];

  collectTabs(tree.children, tabs);
  if (tree.fallback) collectTabs(tree.fallback.children, tabs);

  return tabs;
}
