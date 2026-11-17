"use client";

import {Check, Copy} from "lucide-react";
import {m} from "@/paraglide/messages";
import {Button} from "@rixl/ui/button";

interface CopyButtonProps {
  isLoading: boolean;
  checked: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function CopyButton({isLoading, checked, onClick}: CopyButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={onClick}
      className="border-r px-2 text-xs text-fd-accent-foreground hover:bg-fd-muted-foreground/10"
    >
      {checked ? <Check className="size-3" /> : <Copy className="size-3" />}
      <span className="font-medium">{checked ? m.copied() : m.copy()}</span>
    </Button>
  );
}
