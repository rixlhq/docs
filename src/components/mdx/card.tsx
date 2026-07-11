import {Link} from "@tanstack/react-router";
import {ArrowUpRight} from "lucide-react";
import type {IconName} from "lucide-react/dynamic";
import type {HTMLAttributes, ReactNode} from "react";
import {isValidElement} from "react";
import {Icon} from "@/components/mdx/icon";
import {cn} from "@/lib/cn";

type ArrowType = boolean | "true" | "false";

type Props = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;

  href?: string;
  arrow?: ArrowType;
  cta?: string;
};

const isExternalLink = (href: string): boolean => {
  return href.startsWith("http://") || href.startsWith("https://");
};

const showArrow = (href?: string, arrow?: ArrowType) => {
  if (!href) return false;

  if (arrow === true || arrow === "true") return true;
  if (arrow === false || arrow === "false") return false;

  return isExternalLink(href);
};

function getTitleText(title: ReactNode): string | undefined {
  if (typeof title === "string") return title;
  if (typeof title === "number") return String(title);
  if (Array.isArray(title)) {
    const parts = title.map(getTitleText).filter((part): part is string => Boolean(part));
    return parts.length > 0 ? parts.join(" ") : undefined;
  }
  if (isValidElement(title)) return undefined;
  return undefined;
}

type CardWrapperProps = Omit<HTMLAttributes<HTMLElement>, "title" | "children"> & {
  href?: string;
  isExternal: boolean;
  title: ReactNode;
  className?: string;
  children: ReactNode;
};

function buildCardClassName(href: string | undefined, className: string | undefined) {
  return cn(
    "block group relative overflow-hidden w-full",
    "my-2 p-6 rounded-2xl",
    "font-normal",
    "bg-fd-card border border-fd-border",
    href && "no-underline cursor-pointer",
    href && "focus-within:ring-2 focus-within:ring-fd-primary focus-within:ring-offset-2 focus-within:ring-offset-fd-background",
    href && "hover:-translate-y-0.5 hover:border-fd-primary/30 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200",
    className
  );
}

function CardWrapper({href, isExternal, title, className, children, ...props}: CardWrapperProps) {
  const titleText = getTitleText(title);
  const ariaLabel = href && titleText ? `Navigate to ${titleText}` : undefined;

  if (!href) {
    return (
      <div {...props} className={className} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }

  if (isExternal) {
    return (
      <a {...props} href={href} className={className} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link {...props} to={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function CardContent({
  icon,
  title,
  href,
  arrow,
  children,
}: {
  icon?: IconName;
  title: ReactNode;
  href?: string;
  arrow?: ArrowType;
  children: ReactNode;
}) {
  return (
    <>
      {showArrow(href, arrow) && (
        <ArrowUpRight
          className={cn("absolute top-5 right-5 h-4 w-4", "text-fd-muted-foreground group-hover:text-fd-primary transition-colors")}
        />
      )}
      {icon && Icon && (
        <div
          className={cn(
            "w-fit h-fit p-2 rounded-lg",
            "border shadow-sm",
            href
              ? "border-fd-primary/10 shadow-fd-primary/10 dark:border-fd-primary/20 dark:shadow-fd-primary/20 bg-fd-primary/10 dark:bg-fd-primary/20"
              : "border-fd-border shadow-fd-border bg-fd-background"
          )}
        >
          <Icon name={icon} className={cn("h-5 w-5 text-fd-primary", href ? "text-fd-primary" : "text-fd-muted-foreground")} />
        </div>
      )}
      <h2
        className={cn(
          "not-prose text-lg font-semibold text-fd-foreground",
          icon && "mt-4",
          href && "group-hover:text-fd-primary transition-colors"
        )}
      >
        {title}
      </h2>
      <div className="mt-1 font-normal text-sm leading-6 text-gray-600 dark:text-gray-400 [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </>
  );
}

export const Card = ({
  icon,
  title,
  description: _description,
  href,
  arrow,
  cta: _cta,
  className,
  children,
  ...props
}: Props) => {
  const isExternal = href ? isExternalLink(href) : false;
  const cardClassName = buildCardClassName(href, className);

  return (
    <CardWrapper href={href} isExternal={isExternal} title={title} className={cardClassName} {...props}>
      <CardContent icon={icon} title={title} href={href} arrow={arrow}>
        {children}
      </CardContent>
    </CardWrapper>
  );
};
