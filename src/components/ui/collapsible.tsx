"use client";
import {Collapsible as Primitive} from "radix-ui";
import {type ComponentPropsWithoutRef, forwardRef, useEffect, useState} from "react";
import {cn} from "cn";

const Collapsible = Primitive.Root;

const CollapsibleTrigger = Primitive.CollapsibleTrigger;

const CollapsibleContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Primitive.CollapsibleContent>>(
  ({children, ...props}, ref) => {
    // Animations stay off for the first painted frame so content that starts
    // open doesn't animate in on mount/hydration.
    const [animationsEnabled, setAnimationsEnabled] = useState(false);

    useEffect(() => {
      const frame = requestAnimationFrame(() => setAnimationsEnabled(true));
      return () => cancelAnimationFrame(frame);
    }, []);

    return (
      <Primitive.CollapsibleContent
        ref={ref}
        {...props}
        className={cn(
          "overflow-hidden",
          animationsEnabled && "data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down",
          props.className
        )}
      >
        {children}
      </Primitive.CollapsibleContent>
    );
  }
);

CollapsibleContent.displayName = Primitive.CollapsibleContent.displayName;

export {Collapsible, CollapsibleTrigger, CollapsibleContent};
