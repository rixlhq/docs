"use client";

import Link from "fumadocs-core/link";
import {usePathname} from "fumadocs-core/framework";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {useBreadcrumb, type BreadcrumbOptions} from "fumadocs-core/breadcrumb";
import {cn} from "cn";
import {m} from "@/paraglide/messages";
import {locales} from "@/paraglide/runtime";
import {getFirstPageUrl, isHomeCategory} from "./sidebar-banner";

type Locale = (typeof locales)[number];

export type DocsBreadcrumbProps = BreadcrumbOptions & {
  className?: string;
};

interface CrumbItemProps {
  name: React.ReactNode;
  url?: string;
  isLast: boolean;
  isFirst: boolean;
}

function CrumbItem({name, url, isLast, isFirst}: CrumbItemProps) {
  return (
    <li className={cn("flex items-center", isLast ? "min-w-0" : "shrink-0")}>
      {!isFirst && (
        <span className="text-fd-muted-foreground/50 mx-1.5 shrink-0 select-none" aria-hidden="true">
          /
        </span>
      )}
      {url && !isLast ? (
        <Link href={url} className="hover:text-fd-foreground whitespace-nowrap transition-colors">
          {name}
        </Link>
      ) : (
        <span
          className={cn(isLast ? "text-fd-foreground truncate font-medium" : "whitespace-nowrap")}
          {...(isLast ? {"aria-current": "page"} : {})}
        >
          {name}
        </span>
      )}
    </li>
  );
}

interface RawCrumb {
  name: React.ReactNode;
  url?: string;
}

interface BuildCrumbsOptions {
  lang: string;
  rootName: React.ReactNode;
  categoryUrl?: string;
  items?: RawCrumb[];
}

function buildCrumbs({lang, rootName, categoryUrl, items = []}: BuildCrumbsOptions): RawCrumb[] {
  const isHome = isHomeCategory(rootName, lang);
  const filteredItems = items.filter((item) => item.name !== rootName && item.url !== categoryUrl);

  return [
    {name: m.home({}, {locale: lang as Locale}), url: `/${lang}/home`},
    ...(!isHome && rootName ? [{name: rootName, url: categoryUrl}] : []),
    ...filteredItems.map((item) => ({name: item.name, url: item.url})),
  ];
}

export function DocsBreadcrumb({includeRoot = false, includePage = true, className}: DocsBreadcrumbProps) {
  const pathname = usePathname();
  const {root} = useTreeContext();
  const items = useBreadcrumb(pathname, root, {includeRoot, includePage});
  const [_, lang] = pathname.split("/");

  if (!lang || pathname === `/${lang}/home` || pathname === `/${lang}/home/`) return null;

  const isHome = isHomeCategory(root.name, lang);
  const categoryUrl = !isHome ? (root.name === "API" ? `/${lang}/api` : getFirstPageUrl(root)) : undefined;
  const crumbs = buildCrumbs({lang, rootName: root.name, categoryUrl, items});

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0 pb-2 text-xs font-medium", className)}>
      <ol className="flex flex-wrap items-center text-fd-muted-foreground">
        {crumbs.map((item, i) => (
          <CrumbItem key={i} name={item.name} url={item.url} isLast={i === crumbs.length - 1} isFirst={i === 0} />
        ))}
      </ol>
    </nav>
  );
}
