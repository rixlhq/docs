"use client";

import {ChevronDown} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@rixl/ui/dropdown-menu";
import {m} from "@/paraglide/messages";

interface ViewOptionsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ViewOptionsMenu({open, onOpenChange, children}: ViewOptionsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        aria-label={m.viewOptions()}
        className="h-full cursor-pointer rounded-r-lg px-2 text-fd-accent-foreground hover:bg-fd-muted-foreground/10"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-fd-background">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
