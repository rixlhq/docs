"use client";

import {ChevronDown} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@rixl/ui/dropdown-menu";
import {Button} from "@rixl/ui/button";
import {m} from "@/paraglide/messages";

interface ViewOptionsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ViewOptionsMenu({open, onOpenChange, children}: ViewOptionsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" size="icon-sm" aria-label={m.viewOptions()} />}>
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
