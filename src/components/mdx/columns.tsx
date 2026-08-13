"use client";

import type {HTMLAttributes} from "react";
import {cn} from "cnfast";

interface Props extends HTMLAttributes<HTMLDivElement> {
  cols?: number;
}

export const Columns = ({cols = 2, ...props}: Props) => {
  const validCols = Math.max(1, Math.min(4, cols));

  return (
    <div
      className={cn(
        "card-group grid gap-x-4",
        validCols === 2 && "sm:grid-cols-2",
        validCols === 3 && "sm:grid-cols-3",
        validCols === 4 && "sm:grid-cols-4",
        props.className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
};
