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
import {cn} from "cn";
import {Button} from "@rixl/ui/button";

export function SearchTrigger({hideIfDisabled, size: _size, color: _color, variant: _variant, ...props}: SearchTriggerProps) {
  const {setOpenSearch, enabled} = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  const {className, onClick, ...buttonProps} = props;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      data-search=""
      aria-label={m.openSearch()}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        setOpenSearch(true);
      }}
      {...buttonProps}
    >
      <Search />
    </Button>
  );
}

export function FullSearchTrigger({hideIfDisabled, ...props}: FullSearchTriggerProps) {
  const {enabled, hotKey, setOpenSearch} = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  const {className, onClick, ...buttonProps} = props;
  return (
    <Button
      type="button"
      variant="outline"
      data-search-full=""
      {...buttonProps}
      className={cn(
        "h-auto justify-start gap-2 border-fd-border bg-fd-secondary/50 p-1.5 ps-2 font-normal text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        setOpenSearch(true);
      }}
    >
      <Search className="size-4 shrink-0" />
      <span className="truncate">{m.search()}</span>
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          <kbd key={i} className="rounded-md border bg-fd-background px-1.5 py-0.5 text-[10px] font-mono leading-none">
            {k.display}
          </kbd>
        ))}
      </div>
    </Button>
  );
}
