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

export function getFirstPageUrl(node: PageTree.Root | PageTree.Folder): string | undefined {
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

export function isHomeCategory(name: React.ReactNode, lang?: string): boolean {
  if (typeof name !== "string") return false;
  const homeLocalized = lang && (locales as readonly string[]).includes(lang) ? m.home({}, {locale: lang as Locale}) : m.home();
  return name === "Home" || name === "Documentation Home" || name === homeLocalized;
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
  const content = <span className="truncate">{name}</span>;
  const sharedClass = "flex min-h-8 min-w-0 flex-1 items-center rounded-md px-2 text-sm font-semibold text-fd-foreground";

  if (!href) {
    return <span className={sharedClass}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        sharedClass,
        "transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      )}
    >
      {content}
    </Link>
  );
}

export function SidebarBanner({backUrl}: SidebarBannerProps) {
  const pathname = usePathname();
  const {root} = useTreeContext();
  const [_, lang] = pathname.split("/");

  const isHome = pathname === `/${lang}/home` || pathname === `/${lang}/home/` || isHomeCategory(root.name, lang);

  if (isHome) return null;

  const url = useMemo(() => {
    if (root.name === "API") return `/${lang}/api`;
    return getFirstPageUrl(root);
  }, [root, lang]);
  const categoryUrl = url ?? backUrl;

  const homeLabel = lang && (locales as readonly string[]).includes(lang) ? m.home({}, {locale: lang as Locale}) : m.home();
  const homeUrl = `/${lang}/home`;

  return (
    <div className="md:order-first mb-0 px-2">
      <div className="flex items-center gap-1">
        <HomeButton href={homeUrl} label={homeLabel} />
        <span className="bg-fd-border mx-0.5 h-4 w-px shrink-0" aria-hidden="true" />
        <CategoryTitle href={categoryUrl} name={root.name} />
      </div>
    </div>
  );
}
