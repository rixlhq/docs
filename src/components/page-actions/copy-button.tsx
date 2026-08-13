"use client";

import {Check, Copy} from "lucide-react";
import {m} from "@/paraglide/messages";
import {cn} from "cnfast";

interface CopyButtonProps {
  isLoading: boolean;
  checked: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function CopyButton({isLoading, checked, onClick}: CopyButtonProps) {
  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-l-lg gap-2 cursor-pointer h-full px-2 border-r text-fd-accent-foreground hover:bg-fd-muted-foreground/10"
      )}
    >
      {checked ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      <span className="text-xs font-medium">{checked ? m.copied() : m.copy()}</span>
    </button>
  );
}
