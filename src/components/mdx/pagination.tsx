"use client";

/**
 * Local copy of the pagination piece of
 * `fumadocs-ui/layouts/docs/page/slots/footer` so the "Previous Page" /
 * "Next Page" fallback labels render via paraglide (`m.prevPage`,
 * `m.nextPage`) instead of the fumadocs translation table.
 *
 * Rendered inside our custom `footer.component` slot on `<DocsPage>`, so
 * the fumadocs default Footer is fully replaced.
 */
import Link from "fumadocs-core/link";
import {usePathname} from "fumadocs-core/framework";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useMemo} from "react";
import {useFooterItems} from "fumadocs-ui/utils/use-footer-items";
import {m} from "@/paraglide/messages";
import {cn} from "@/lib/cn";
import {isActive} from "@/lib/is-active";

type PageItem = {
  url: string;
  name: React.ReactNode;
  description?: React.ReactNode;
};

function PaginationItem({item, index}: {item: PageItem; index: 0 | 1}) {
  const Icon = index === 0 ? ChevronLeft : ChevronRight;
  const fallback = index === 0 ? m.prevPage() : m.nextPage();

  return (
    <Link
      href={item.url}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full",
        index === 1 && "text-end"
      )}
    >
      <div className={cn("inline-flex items-center gap-1.5 font-medium", index === 1 && "flex-row-reverse")}>
        <Icon className="-mx-1 size-4 shrink-0 rtl:rotate-180" />
        <p>{item.name}</p>
      </div>
      <p className="text-fd-muted-foreground truncate">{item.description ?? fallback}</p>
    </Link>
  );
}

export function Pagination({className}: {className?: string}) {
  const footerList = useFooterItems();
  const pathname = usePathname();

  const {previous, next} = useMemo(() => {
    const idx = footerList.findIndex((item) => isActive(item.url, pathname));
    if (idx === -1) return {};
    return {previous: footerList[idx - 1], next: footerList[idx + 1]};
  }, [footerList, pathname]);

  if (!previous && !next) return null;

  return (
    <div className={cn("@container grid gap-4", previous && next ? "grid-cols-2" : "grid-cols-1", className)}>
      {previous && <PaginationItem item={previous as PageItem} index={0} />}
      {next && <PaginationItem item={next as PageItem} index={1} />}
    </div>
  );
}
