"use client";

import {useMemo} from "react";
import Link from "fumadocs-core/link";
import {usePathname} from "fumadocs-core/framework";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {cn} from "cn";
import {LayoutGrid} from "lucide-react";
import {m} from "@/paraglide/messages";
import {locales} from "@/paraglide/runtime";
import type * as PageTree from "fumadocs-core/page-tree";

type Locale = (typeof locales)[number];

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

interface HomeButtonProps {
  href: string;
  label: string;
}

function HomeButton({href, label}: HomeButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors",
        "hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      )}
    >
      <LayoutGrid className="size-4" />
    </Link>
  );
}

interface CategoryTitleProps {
  href?: string;
  name: React.ReactNode;
}

function CategoryTitle({href, name}: CategoryTitleProps) {
  if (!href) {
    return (
      <span className="flex min-h-8 min-w-0 flex-1 items-center px-2 text-base font-semibold text-fd-foreground">
        <span className="truncate">{name}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-8 min-w-0 flex-1 items-center rounded-md px-2 text-base font-semibold text-fd-foreground transition-colors",
        "hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      )}
    >
      <span className="truncate">{name}</span>
    </Link>
  );
}

export function SidebarBanner({backUrl}: SidebarBannerProps) {
  const pathname = usePathname();
  const {root} = useTreeContext();
  const url = useMemo(() => getFirstPageUrl(root), [root]);
  const categoryUrl = url ?? backUrl;

  const [_, lang] = pathname.split("/");
  const homeLabel = lang && (locales as readonly string[]).includes(lang) ? m.home({}, {locale: lang as Locale}) : m.home();

  return (
    <div className="md:order-first mb-0 px-2">
      {backUrl ? (
        <div className="flex items-center gap-1">
          <HomeButton href={backUrl} label={homeLabel} />
          <span className="bg-fd-border mx-0.5 h-4 w-px shrink-0" aria-hidden="true" />
          <CategoryTitle href={categoryUrl} name={root.name} />
        </div>
      ) : (
        <CategoryTitle href={url} name={root.name} />
      )}
    </div>
  );
}
