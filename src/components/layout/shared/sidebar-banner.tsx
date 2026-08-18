"use client";

import {useMemo} from "react";
import Link from "fumadocs-core/link";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {cn} from "cnfast";
import type * as PageTree from "fumadocs-core/page-tree";
import {ArrowLeft, Search} from "lucide-react";

export interface SidebarBannerProps {
  filter: string;
  onFilterChange: (value: string) => void;
  lang: string;
}

function getFirstPageUrl(node: PageTree.Root | PageTree.Folder): string | undefined {
  if ("index" in node && node.index?.url) {
    return node.index.url;
  }

  for (const child of node.children) {
    if (child.type === "page") {
      return child.url;
    }

    if (child.type === "folder") {
      const url = getFirstPageUrl(child);
      if (url) return url;
    }
  }

  return undefined;
}

function getSectionUrl(node: PageTree.Root | PageTree.Folder): string | undefined {
  const url = getFirstPageUrl(node);
  if (!url) return undefined;

  const segments = url.split("/").filter(Boolean);
  if (segments.length <= 2) return undefined;

  return `/${segments[0]}/${segments[1]}`;
}

function isProductRoot(node: PageTree.Root | PageTree.Folder): node is PageTree.Folder {
  return "root" in node && node.root === true;
}

export function SidebarBanner({filter, onFilterChange, lang}: SidebarBannerProps) {
  const {root} = useTreeContext();
  const backUrl = useMemo(() => getSectionUrl(root), [root]);
  const indexUrl = useMemo(() => ("index" in root && root.index?.url) || getFirstPageUrl(root), [root]);

  return (
    <div className="flex flex-col gap-3 px-2 pb-2">
      {isProductRoot(root) && (
        <div className="flex items-center gap-2">
          {backUrl ? (
            <Link
              href={backUrl}
              className={cn(
                "p-1 -ml-1 rounded-md text-fd-muted-foreground",
                "hover:bg-fd-accent hover:text-fd-foreground"
              )}
            >
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back</span>
            </Link>
          ) : null}
          <Link
            href={indexUrl ?? `/${lang}/sdk`}
            className="text-base font-semibold text-fd-foreground hover:text-fd-accent-foreground"
          >
            {root.name}
          </Link>
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground pointer-events-none" />
        <input
          aria-label="Filter sidebar"
          type="search"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter sidebar"
          className={cn(
            "w-full rounded-md border bg-fd-secondary/50 pl-8 pr-3 py-1.5 text-sm text-fd-foreground",
            "placeholder:text-fd-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-fd-primary"
          )}
        />
      </div>
    </div>
  );
}
