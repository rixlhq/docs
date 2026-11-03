"use client";

import type {ReactNode} from "react";
import Link from "fumadocs-core/link";
import {usePathname} from "fumadocs-core/framework";
import {useTreeContext, useTreePath} from "fumadocs-ui/contexts/tree";
import {SidebarFolder, SidebarFolderContent, SidebarFolderLink, SidebarFolderTrigger} from "fumadocs-ui/components/sidebar/base";
import {ChevronRight} from "lucide-react";
import {cn} from "cn";
import type * as PageTree from "fumadocs-core/page-tree";
import {getFirstPageUrl, isHomeCategory} from "./sidebar-banner";

interface FolderWithCategory extends PageTree.Folder {
  isCategory?: boolean;
  categoryUrl?: string;
}

export interface SidebarFolderItemProps {
  item: FolderWithCategory;
  children: ReactNode;
}

function isUrlActive(href: string, pathname: string): boolean {
  const normHref = href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
  const normPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return normHref === normPath;
}

function isCategoryFolder(item: FolderWithCategory, root: PageTree.Root | PageTree.Folder): boolean {
  if (item.isCategory) return true;
  return isHomeCategory(root.name) || root.name === "SDK";
}

interface CategoryButtonProps {
  item: FolderWithCategory;
  url: string;
}

function CategoryButton({item, url}: CategoryButtonProps) {
  const pathname = usePathname();
  const active = isUrlActive(url, pathname);

  return (
    <Link
      href={url}
      data-active={active}
      className={cn(
        "relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere",
        "[&_svg]:size-4 [&_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none",
        "data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors"
      )}
    >
      {item.icon}
      <span className="fd-page-tree-item-name flex-1 truncate">{item.name}</span>
      <ChevronRight className="ms-auto size-4 shrink-0 opacity-60 transition-transform" aria-hidden="true" />
    </Link>
  );
}

function DefaultFolder({item, children}: SidebarFolderItemProps) {
  const path = useTreePath();
  const pathname = usePathname();
  const active = path.includes(item);
  const indexActive = item.index ? isUrlActive(item.index.url, pathname) : false;

  return (
    <SidebarFolder collapsible={item.collapsible} active={active} defaultOpen={item.defaultOpen}>
      {item.index ? (
        <SidebarFolderLink href={item.index.url} active={indexActive} external={item.index.external}>
          {item.icon}
          {item.name}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger>
          {item.icon}
          {item.name}
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent>{children}</SidebarFolderContent>
    </SidebarFolder>
  );
}

export function SidebarFolderItem({item, children}: SidebarFolderItemProps) {
  const {root} = useTreeContext();
  const isCategory = isCategoryFolder(item, root);
  const categoryUrl = isCategory ? (item.categoryUrl ?? getFirstPageUrl(item)) : undefined;

  if (isCategory && categoryUrl) {
    return <CategoryButton item={item} url={categoryUrl} />;
  }

  return <DefaultFolder item={item}>{children}</DefaultFolder>;
}
