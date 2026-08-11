"use client";

import {cn} from "cnfast";
import {optionItemVariants} from "./option-item-variants";
import {OptionItemContent} from "./option-item-content";

interface OptionButtonItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function OptionButtonItem({icon, title, desc, onClick}: OptionButtonItemProps) {
  return (
    <button type="button" className={cn(optionItemVariants())} onClick={onClick}>
      <OptionItemContent icon={icon} title={title} desc={desc} />
    </button>
  );
}
