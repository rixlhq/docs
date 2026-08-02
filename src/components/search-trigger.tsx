"use client";

/**
 * Local copies of `fumadocs-ui/layouts/shared/slots/search-trigger` so both
 * the icon-only ("sm") and inline ("full") triggers read their strings
 * from paraglide (`m.openSearch`, `m.search`) instead of the fumadocs
 * translation table.
 *
 * Wired into the layout via `slots.searchTrigger` in `layout.shared.tsx`.
 */
import {Search} from "lucide-react";
import type {ComponentProps} from "react";
import {useSearchContext} from "fumadocs-ui/contexts/search";
import {m} from "@/paraglide/messages";
import {cn} from "@/lib/cn";
import {buttonVariants} from "@/components/ui/button";

type SearchTriggerProps = ComponentProps<"button"> & {
  hideIfDisabled?: boolean;
};

export function SearchTrigger({hideIfDisabled, ...props}: SearchTriggerProps) {
  const size = "icon-sm";
  const color = "ghost";
  const {setOpenSearch, enabled} = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  return (
    <button
      type="button"
      className={cn(buttonVariants({size, color}), props.className)}
      data-search=""
      aria-label={m.openSearch()}
      onClick={() => setOpenSearch(true)}
      {...props}
    >
      <Search />
    </button>
  );
}

type FullSearchTriggerProps = ComponentProps<"button"> & {
  hideIfDisabled?: boolean;
};

export function FullSearchTrigger({hideIfDisabled, ...props}: FullSearchTriggerProps) {
  const {enabled, hotKey, setOpenSearch} = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  return (
    <button
      type="button"
      data-search-full=""
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground",
        props.className
      )}
      onClick={() => setOpenSearch(true)}
    >
      <Search className="size-4" />
      {m.search()}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          <kbd key={i} className="rounded-md border bg-fd-background px-1.5">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
