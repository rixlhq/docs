"use client";

import {cn} from "cnfast";
import {optionItemVariants} from "./option-item-variants";
import {OptionItemContent} from "./option-item-content";

interface OptionLinkItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function OptionLinkItem({href, icon, title, desc}: OptionLinkItemProps) {
  return (
    <a href={href} rel="noreferrer noopener" target="_blank" className={cn(optionItemVariants())}>
      <OptionItemContent icon={icon} title={title} desc={desc} href={href} />
    </a>
  );
}
