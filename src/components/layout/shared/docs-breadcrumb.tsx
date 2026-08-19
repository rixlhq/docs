"use client";

import {ChevronRight} from "lucide-react";
import Link from "fumadocs-core/link";
import {usePathname} from "fumadocs-core/framework";
import {useTreeContext} from "fumadocs-ui/contexts/tree";
import {useBreadcrumb, type BreadcrumbOptions} from "fumadocs-core/breadcrumb";
import {cn} from "cnfast";

export type DocsBreadcrumbProps = BreadcrumbOptions & {
  className?: string;
};

export function DocsBreadcrumb({
  includeRoot = true,
  includePage = false,
  className,
}: DocsBreadcrumbProps) {
  const pathname = usePathname();
  const {root} = useTreeContext();
  const items = useBreadcrumb(pathname, root, {includeRoot, includePage});
  const [_, lang] = pathname.split("/");

  if (!lang) return null;

  // On the docs directory itself there is nothing to navigate back to.
  if (items.length === 0 && pathname === `/${lang}/home`) return null;

  const crumbs = [
    {name: "Home", url: `/${lang}/home`},
    ...items.map((item) => ({name: item.name, url: item.url})),
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-sm text-fd-muted-foreground", className)}>
      {crumbs.map((item, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {i !== 0 && <ChevronRight className="size-3.5 shrink-0" />}
            {item.url && !isLast ? (
              <Link
                href={item.url}
                className="truncate transition-opacity hover:opacity-80"
              >
                {item.name}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast && "text-fd-foreground font-medium"
                )}
              >
                {item.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
