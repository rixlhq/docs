"use client";

import {ExternalLinkIcon} from "lucide-react";
import {cn} from "cnfast";

interface OptionContentProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href?: string;
}

export function OptionItemContent({icon, title, desc, href}: OptionContentProps) {
  return (
    <>
      <span className="w-10 h-10 border text-fd-muted-foreground/75 group-hover:text-fd-accent-foreground/80 flex items-center justify-center rounded-lg">
        {icon}
      </span>
      <span className={cn("block")}>
        <span className={cn("flex gap-2 items-center font-medium")}>
          {title}
          {href ? <ExternalLinkIcon className="text-fd-muted-foreground size-3.5" /> : null}
        </span>
        <span className={cn("text-xs text-fd-muted-foreground")}>{desc}</span>
      </span>
    </>
  );
}
