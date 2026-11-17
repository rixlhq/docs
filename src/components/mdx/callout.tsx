import type {LucideIcon} from "lucide-react";
import {AlertCircle, AlertTriangle, CheckCircle, Info} from "lucide-react";
import type {ReactNode} from "react";
import {Alert, AlertDescription, AlertTitle} from "@rixl/ui/alert";
import {cn} from "cn";

/**
 * Callout types supported by the component
 */
type CalloutType = "tip" | "info" | "warning" | "warn" | "error";

/**
 * Props for the Callout component
 */
interface CalloutProps {
  type?: CalloutType;
  title?: ReactNode;
  children: ReactNode;
}

const CALLOUT_ICON: Record<CalloutType, LucideIcon> = {
  tip: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  warn: AlertTriangle,
  error: AlertCircle,
};

const CALLOUT_VARIANT = {
  tip: "success",
  info: "default",
  warning: "warning",
  warn: "warning",
  error: "destructive",
} as const;

/**
 * Callout - Theme-aware alert with semantic colors and accessibility.
 * Composes the `@rixl/ui` Alert primitives; MDX-compatible.
 */
export function Callout({type = "info", title, children}: CalloutProps) {
  const IconComponent = CALLOUT_ICON[type] ?? CALLOUT_ICON.info;
  const variant = CALLOUT_VARIANT[type] ?? CALLOUT_VARIANT.info;

  return (
    <Alert variant={variant} className={cn("not-prose my-6")}>
      <IconComponent aria-hidden="true" />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription
        className={cn(
          "text-sm leading-relaxed",
          "[&>p]:mb-2 [&>p:last-child]:mb-0",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          "[&_strong]:font-semibold [&_code]:font-mono [&_code]:text-xs",
          "[&_a]:underline [&_a]:underline-offset-2"
        )}
      >
        {children}
      </AlertDescription>
    </Alert>
  );
}
