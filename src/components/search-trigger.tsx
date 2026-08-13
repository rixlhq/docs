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
import {useSearchContext} from "fumadocs-ui/contexts/search";
import type {SearchTriggerProps, FullSearchTriggerProps} from "fumadocs-ui/layouts/shared/slots/search-trigger";
import {m} from "@/paraglide/messages";
import {cn} from "cnfast";
import {buttonVariants} from "@/components/ui/button";

export function SearchTrigger({hideIfDisabled, size: _size, color: _color, ...props}: SearchTriggerProps) {
  const size = "icon-sm";
  const color = "ghost";
  const {setOpenSearch, enabled} = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  const {className, onClick, ...buttonProps} = props;
  return (
    <button
      type="button"
      data-search=""
      aria-label={m.openSearch()}
      className={cn(buttonVariants({size, color}), className)}
      onClick={(e) => {
        onClick?.(e);
        setOpenSearch(true);
      }}
      {...buttonProps}
    >
      <Search />
    </button>
  );
}

export function FullSearchTrigger({hideIfDisabled, ...props}: FullSearchTriggerProps) {
  const {enabled, hotKey, setOpenSearch} = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  const {className, onClick, ...buttonProps} = props;
  return (
    <button
      type="button"
      data-search-full=""
      {...buttonProps}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        setOpenSearch(true);
      }}
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
