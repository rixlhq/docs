"use client";

import {useMemo} from "react";
import Link from "fumadocs-core/link";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {cn} from "cnfast";
import {LayoutGrid} from "lucide-react";
import type * as PageTree from "fumadocs-core/page-tree";

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

interface SidebarBannerProps {
  backUrl?: string;
}

export function SidebarBanner({backUrl}: SidebarBannerProps) {
  const {root} = useTreeContext();
  const url = useMemo(() => getFirstPageUrl(root), [root]);

  return (
    <div className="md:order-first mb-0 px-2">
      {backUrl ? (
        <Link
          href={backUrl}
          className={cn(
            "flex items-center gap-2 text-base font-semibold text-fd-foreground",
            "hover:text-fd-accent-foreground hover:underline"
          )}
        >
          <LayoutGrid className="size-4" />
          <span>{root.name}</span>
        </Link>
      ) : url ? (
        <Link
          href={url}
          className={cn("block text-base font-semibold text-fd-foreground", "hover:text-fd-accent-foreground hover:underline")}
        >
          {root.name}
        </Link>
      ) : (
        <span className="block text-base font-semibold text-fd-foreground">{root.name}</span>
      )}
    </div>
  );
}
