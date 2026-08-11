"use client";

import {CopyCheckIcon, LinkIcon} from "lucide-react";
import type {ComponentPropsWithoutRef} from "react";
import {useCopyButton} from "fumadocs-ui/utils/use-copy-button";
import {m} from "@/paraglide/messages";
import {cn} from "cnfast";
import {buttonVariants} from "@/components/ui/button";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = ComponentPropsWithoutRef<HeadingTag> & {
  as?: HeadingTag;
};

/**
 * Local copy of `fumadocs-ui/components/heading` so the anchor-copy button's
 * `aria-label` can be sourced from paraglide (`m.copyAnchorLink`).
 */
export function Heading({as, ...props}: HeadingProps) {
  const As = as ?? "h1";
  const [isChecked, onCopy] = useCopyButton(() => {
    if (!props.id) return;
    const url = new URL(window.location.href);
    url.hash = props.id;
    return navigator.clipboard.writeText(url.href).catch(() => {});
  });

  if (!props.id) return <As {...props} />;

  return (
    <As {...props} className={cn("group/heading flex scroll-m-28 flex-row items-center gap-1", props.className)}>
      <a data-card="" href={`#${props.id}`}>
        {props.children}
      </a>
      <button
        type="button"
        aria-label={m.copyAnchorLink()}
        className={cn(
          buttonVariants({variant: "ghost", size: "icon-xs"}),
          "not-prose shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100"
        )}
        onClick={onCopy}
      >
        {isChecked ? <CopyCheckIcon /> : <LinkIcon />}
      </button>
    </As>
  );
}
