import {Link} from "@tanstack/react-router";
import {ArrowUpRight} from "lucide-react";
import type {HTMLAttributes, ReactNode} from "react";
import {Icon, type IconName} from "@/components/mdx/icon";
import {m} from "@/paraglide/messages";
import {cn} from "cn";

type ArrowType = boolean | "true" | "false";

interface BrandTheme {
  badge: string;
  cardHoverBorder: string;
  cardHoverShadow: string;
  titleHover: string;
  arrowHover: string;
}

const BRAND_THEMES: Record<string, BrandTheme> = {
  react: {
    badge: "border-[#00D8FE]/30 bg-[#00D8FE]/10 shadow-[#00D8FE]/10 dark:border-[#00D8FE]/30 dark:bg-[#00D8FE]/15",
    cardHoverBorder: "hover:border-[#00D8FE]/50",
    cardHoverShadow: "hover:shadow-[#00D8FE]/10",
    titleHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
  },
  vue: {
    badge: "border-[#42B883]/30 bg-[#42B883]/10 shadow-[#42B883]/10 dark:border-[#42B883]/30 dark:bg-[#42B883]/15",
    cardHoverBorder: "hover:border-[#42B883]/50",
    cardHoverShadow: "hover:shadow-[#42B883]/10",
    titleHover: "group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]",
    arrowHover: "group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]",
  },
  svelte: {
    badge: "border-[#FF3E00]/30 bg-[#FF3E00]/10 shadow-[#FF3E00]/10 dark:border-[#FF3E00]/30 dark:bg-[#FF3E00]/15",
    cardHoverBorder: "hover:border-[#FF3E00]/50",
    cardHoverShadow: "hover:shadow-[#FF3E00]/10",
    titleHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
    arrowHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
  },
  angular: {
    badge: "border-[#DD0031]/30 bg-[#DD0031]/10 shadow-[#DD0031]/10 dark:border-[#DD0031]/30 dark:bg-[#DD0031]/15",
    cardHoverBorder: "hover:border-[#DD0031]/50",
    cardHoverShadow: "hover:shadow-[#DD0031]/10",
    titleHover: "group-hover:text-[#dc2626] dark:group-hover:text-[#f87171]",
    arrowHover: "group-hover:text-[#dc2626] dark:group-hover:text-[#f87171]",
  },
  lit: {
    badge: "border-[#324FFF]/30 bg-[#324FFF]/10 shadow-[#324FFF]/10 dark:border-[#324FFF]/30 dark:bg-[#324FFF]/15",
    cardHoverBorder: "hover:border-[#324FFF]/50",
    cardHoverShadow: "hover:shadow-[#324FFF]/10",
    titleHover: "group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa]",
    arrowHover: "group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa]",
  },
  core: {
    badge: "border-[#3178C6]/30 bg-[#3178C6]/10 shadow-[#3178C6]/10 dark:border-[#3178C6]/30 dark:bg-[#3178C6]/15",
    cardHoverBorder: "hover:border-[#3178C6]/50",
    cardHoverShadow: "hover:shadow-[#3178C6]/10",
    titleHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
  },
  ui: {
    badge: "border-[#8B5CF6]/30 bg-[#8B5CF6]/10 shadow-[#8B5CF6]/10 dark:border-[#8B5CF6]/30 dark:bg-[#8B5CF6]/15",
    cardHoverBorder: "hover:border-[#8B5CF6]/50",
    cardHoverShadow: "hover:shadow-[#8B5CF6]/10",
    titleHover: "group-hover:text-[#7c3aed] dark:group-hover:text-[#a78bfa]",
    arrowHover: "group-hover:text-[#7c3aed] dark:group-hover:text-[#a78bfa]",
  },
};

function getBrandTheme(brand?: string, icon?: IconName): BrandTheme | undefined {
  if (brand && brand in BRAND_THEMES) return BRAND_THEMES[brand];
  if (typeof icon === "string" && icon in BRAND_THEMES) return BRAND_THEMES[icon];
  return undefined;
}

type Props = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  icon?: IconName;
  brand?: string;
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

type CardWrapperProps = Omit<HTMLAttributes<HTMLElement>, "title" | "children"> & {
  href?: string;
  isExternal: boolean;
  title: ReactNode;
  className?: string;
  children: ReactNode;
};

function buildCardClassName(
  href: string | undefined,
  brandTheme: BrandTheme | undefined,
  className: string | undefined
) {
  const hoverStyles = brandTheme
    ? cn(brandTheme.cardHoverBorder, brandTheme.cardHoverShadow)
    : "hover:border-fd-primary/30";

  return cn(
    "block group relative overflow-hidden w-full",
    "my-2 p-6 rounded-2xl",
    "font-normal",
    "bg-fd-card border border-fd-border",
    href && "no-underline cursor-pointer",
    href && "focus-within:ring-2 focus-within:ring-fd-primary focus-within:ring-offset-2 focus-within:ring-offset-fd-background",
    href && "hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200",
    href && hoverStyles,
    className
  );
}

function CardWrapper({href, isExternal, title, className, children, ...props}: CardWrapperProps) {
  const ariaLabel = href && typeof title === "string" ? m.navigateTo({title}) : undefined;

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

interface CardIconBadgeProps {
  icon: IconName;
  href?: string;
  brandTheme?: BrandTheme;
}

function getBadgeContainerClass(brandTheme?: BrandTheme, href?: string): string {
  if (brandTheme) {
    return brandTheme.badge;
  }
  if (href) {
    return "border-fd-primary/10 shadow-fd-primary/10 dark:border-fd-primary/20 dark:shadow-fd-primary/20 bg-fd-primary/10 dark:bg-fd-primary/20";
  }
  return "border-fd-border shadow-fd-border bg-fd-background";
}

function getBadgeIconColor(brandTheme?: BrandTheme, href?: string): string | undefined {
  if (brandTheme) {
    return undefined;
  }
  if (href) {
    return "text-fd-primary";
  }
  return "text-fd-muted-foreground";
}

function CardIconBadge({icon, href, brandTheme}: CardIconBadgeProps) {
  return (
    <div className={cn("w-fit h-fit p-2 rounded-lg border shadow-sm transition-colors", getBadgeContainerClass(brandTheme, href))}>
      <Icon name={icon} className={cn("h-5 w-5", getBadgeIconColor(brandTheme, href))} />
    </div>
  );
}

function CardContent({
  icon,
  title,
  href,
  arrow,
  brandTheme,
  children,
}: {
  icon?: IconName;
  title: ReactNode;
  href?: string;
  arrow?: ArrowType;
  brandTheme?: BrandTheme;
  children: ReactNode;
}) {
  const arrowClass = brandTheme ? brandTheme.arrowHover : "text-fd-muted-foreground group-hover:text-fd-primary";
  const titleClass = brandTheme ? brandTheme.titleHover : href ? "group-hover:text-fd-primary" : undefined;

  return (
    <>
      {showArrow(href, arrow) && (
        <ArrowUpRight className={cn("absolute top-5 right-5 h-4 w-4 transition-colors", arrowClass)} />
      )}
      {icon && <CardIconBadge icon={icon} href={href} brandTheme={brandTheme} />}
      <h2 className={cn("not-prose text-lg font-semibold text-fd-foreground transition-colors", icon && "mt-4", titleClass)}>
        {title}
      </h2>
      <div className="mt-1 font-normal text-sm leading-6 text-gray-600 dark:text-gray-400 [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </>
  );
}

export const Card = ({icon, brand, title, description: _description, href, arrow, cta: _cta, className, children, ...props}: Props) => {
  const isExternal = href !== undefined && isExternalLink(href);
  const brandTheme = getBrandTheme(brand, icon);
  const cardClassName = buildCardClassName(href, brandTheme, className);

  return (
    <CardWrapper href={href} isExternal={isExternal} title={title} className={cardClassName} {...props}>
      <CardContent icon={icon} title={title} href={href} arrow={arrow} brandTheme={brandTheme}>
        {children}
      </CardContent>
    </CardWrapper>
  );
};
