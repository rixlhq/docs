import type {LucideIcon} from "lucide-react";
import {AlertCircle, AlertTriangle, CheckCircle, Info} from "lucide-react";
import type {ReactNode} from "react";
import {cn} from "cnfast";

/**
 * Callout types supported by the component
 */
type CalloutType = "tip" | "info" | "warning" | "warn" | "error";

interface CalloutConfig {
  icon: LucideIcon;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconClass: string;
}

/**
 * Props for the Callout component
 */
interface CalloutProps {
  type?: CalloutType;
  title?: ReactNode;
  children: ReactNode;
}

const CALLOUT_CONFIG: Record<CalloutType, CalloutConfig> = {
  tip: {
    icon: CheckCircle,
    bgClass: "bg-green-50 dark:bg-green-900/20",
    borderClass: "border-green-200 dark:border-green-600/50",
    textClass: "text-green-800 dark:text-green-100",
    iconClass: "text-green-600 dark:text-green-300",
  },
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    borderClass: "border-blue-200 dark:border-blue-600/50",
    textClass: "text-blue-800 dark:text-blue-100",
    iconClass: "text-blue-600 dark:text-blue-300",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-yellow-50 dark:bg-yellow-900/20",
    borderClass: "border-yellow-200 dark:border-yellow-600/50",
    textClass: "text-yellow-800 dark:text-yellow-100",
    iconClass: "text-yellow-600 dark:text-yellow-300",
  },
  warn: {
    icon: AlertTriangle,
    bgClass: "bg-yellow-50 dark:bg-yellow-900/20",
    borderClass: "border-yellow-200 dark:border-yellow-600/50",
    textClass: "text-yellow-800 dark:text-yellow-100",
    iconClass: "text-yellow-600 dark:text-yellow-300",
  },
  error: {
    icon: AlertCircle,
    bgClass: "bg-red-50 dark:bg-red-900/20",
    borderClass: "border-red-200 dark:border-red-600/50",
    textClass: "text-red-800 dark:text-red-100",
    iconClass: "text-red-600 dark:text-red-300",
  },
};

/**
 * Callout - Theme-aware alert component with semantic colors
 * MDX-compatible version with proper contrast ratios and accessibility
 */
export function Callout({type = "info", title, children}: CalloutProps) {
  const {icon: IconComponent, bgClass, borderClass, textClass, iconClass} = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.info;

  return (
    <div className={cn("rounded-2xl border p-4 my-6 transition-colors", "not-prose", bgClass, borderClass, textClass)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex items-center">
          <IconComponent className={cn("h-5 w-5", iconClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <header>
              <h4 className={cn("font-semibold text-current m-0 leading-tight", children && "mb-2")}>{title}</h4>
            </header>
          )}
          <div
            className={cn(
              "text-sm leading-relaxed",
              "[&>p]:mb-2 [&>p:last-child]:mb-0",
              "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
              "[&_strong]:font-semibold [&_code]:font-mono [&_code]:text-xs",
              "[&_a]:underline [&_a]:underline-offset-2"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
