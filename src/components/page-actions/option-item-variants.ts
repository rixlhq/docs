"use client";

import {cva} from "class-variance-authority";
import {cn} from "cnfast";

export const optionItemVariants = cva(
  cn("group p-2 [&_svg]:size-4 rounded-lg inline-flex items-center gap-2 cursor-pointer", "hover:bg-fd-muted-foreground/5", "text-sm")
);
