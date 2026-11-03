"use client";

import Link from "fumadocs-core/link";
import {usePathname} from "fumadocs-core/framework";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {useBreadcrumb, type BreadcrumbOptions} from "fumadocs-core/breadcrumb";
import {cn} from "cn";
import {ChevronRight} from "lucide-react";
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
      {!isFirst && <ChevronRight className="text-fd-muted-foreground/60 mx-1.5 size-3.5 shrink-0" aria-hidden="true" />}
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
  pathname: string;
  lang: string;
  rootName: React.ReactNode;
  categoryUrl?: string;
  items?: RawCrumb[];
}

function getSectionCrumb(section: string | undefined, product: string | undefined, lang: string): RawCrumb | null {
  if (!section || section === "home") return null;
  if (section === "sdk" && product) {
    return {name: "SDK", url: `/${lang}/sdk`};
  }
  return null;
}

function buildCrumbs({pathname, lang, rootName, categoryUrl, items = []}: BuildCrumbsOptions): RawCrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[1];
  const product = segments[2];

  const sectionCrumb = getSectionCrumb(section, product, lang);
  const isHome = isHomeCategory(rootName, lang);
  const isHomeSection = section === "home";

  const filteredItems = items.filter(
    (item) => item.name !== rootName && item.name !== sectionCrumb?.name && item.url !== categoryUrl && item.url !== sectionCrumb?.url
  );

  return [
    ...(!isHomeSection ? [{name: m.home({}, {locale: lang as Locale}), url: `/${lang}/home`}] : []),
    ...(sectionCrumb ? [sectionCrumb] : []),
    ...(!isHome && rootName && rootName !== sectionCrumb?.name ? [{name: rootName, url: categoryUrl}] : []),
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
  const crumbs = buildCrumbs({pathname, lang, rootName: root.name, categoryUrl, items});

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0 text-xs font-medium", className)}>
      <ol className="flex flex-wrap items-center text-fd-muted-foreground">
        {crumbs.map((item, i) => (
          <CrumbItem key={i} name={item.name} url={item.url} isLast={i === crumbs.length - 1} isFirst={i === 0} />
        ))}
      </ol>
    </nav>
  );
}
