"use client";
import {Popover as Primitive} from "radix-ui";
import * as React from "react";
import {cn} from "cnfast";

const Popover = Primitive.Root;

const PopoverTrigger = Primitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({className, align = "center", sideOffset = 4, ...props}, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      side="bottom"
      className={cn(
        "z-50 origin-(--radix-popover-content-transform-origin) min-w-[240px] max-w-[98vw] rounded-xl border bg-fd-popover/60 backdrop-blur-lg p-2 text-sm text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in",
        className
      )}
      {...props}
    />
  </Primitive.Portal>
));
PopoverContent.displayName = Primitive.Content.displayName;

export {Popover, PopoverTrigger, PopoverContent};
