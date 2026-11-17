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
    <Button type="button" variant="outline" size="sm" disabled={isLoading} onClick={onClick}>
      {checked ? <Check /> : <Copy />}
      {checked ? m.copied() : m.copy()}
    </Button>
  );
}
