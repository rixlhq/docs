"use client";

import {ChevronDown} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@rixl/ui/popover";

interface ViewOptionsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ViewOptionsPopover({open, onOpenChange, children}: ViewOptionsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="cursor-pointer text-fd-accent-foreground hover:bg-fd-muted-foreground/10 rounded-r-lg px-2 h-full">
        <ChevronDown className="w-3.5 h-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="flex flex-col overflow-auto border mt-2 bg-fd-background">
        {children}
      </PopoverContent>
    </Popover>
  );
}
