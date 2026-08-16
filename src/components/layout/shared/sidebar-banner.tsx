"use client";

import {useMemo} from "react";
import Link from "fumadocs-core/link";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {cn} from "cnfast";
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

export function SidebarBanner() {
  const {root} = useTreeContext();
  const url = useMemo(() => getFirstPageUrl(root), [root]);

  return (
    <div className="mb-1 px-2">
      {url ? (
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
