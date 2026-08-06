"use client";

import {X} from "lucide-react";
import {type HTMLAttributes, Fragment, useEffect, useState} from "react";
import {m} from "@/paraglide/messages";
import {cn} from "@/lib/cn";
import {buttonVariants} from "@/components/ui/button";

type BannerVariant = "rainbow" | "normal";

type BannerProps = HTMLAttributes<HTMLDivElement> & {
  height?: string;
  variant?: BannerVariant;
  rainbowColors?: string[];
  changeLayout?: boolean;
};

const DEFAULT_RAINBOW_COLORS = [
  "rgba(0,149,255,0.56)",
  "rgba(231,77,255,0.77)",
  "rgba(255,0,0,0.73)",
  "rgba(131,255,166,0.66)",
];

function BannerCloseButton({onClose}: {onClose: () => void}) {
  return (
    <button
      type="button"
      aria-label={m.closeBanner()}
      onClick={onClose}
      className={cn(
        buttonVariants({
          color: "ghost",
          className: "absolute inset-e-2 top-1/2 -translate-y-1/2 text-fd-muted-foreground/50",
          size: "icon-sm",
        })
      )}
    >
      <X />
    </button>
  );
}

function BannerHeadStyles({
  globalKey,
  height,
  id,
  changeLayout,
  open,
}: {
  globalKey: string | null;
  height: string;
  id?: string;
  changeLayout: boolean;
  open: boolean;
}) {
  return (
    <>
      {changeLayout && open ? (
        <style>
          {globalKey
            ? `:root:not(.${globalKey}) { --fd-banner-height: ${height}; }`
            : `:root { --fd-banner-height: ${height}; }`}
        </style>
      ) : null}
      {globalKey ? <style>{`.${globalKey} #${id} { display: none; }`}</style> : null}
      {globalKey ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `if (localStorage.getItem('${globalKey}') === 'true') document.documentElement.classList.add('${globalKey}');`,
          }}
        />
      ) : null}
    </>
  );
}

function useBannerState(id?: string) {
  const [open, setOpen] = useState(true);
  const globalKey = id ? `nd-banner-${encodeBase32(id)}` : null;

  useEffect(() => {
    if (globalKey && localStorage.getItem(globalKey) === "true") setOpen(false);
  }, [globalKey]);

  const onClose = () => {
    setOpen(false);
    if (globalKey) localStorage.setItem(globalKey, "true");
  };

  return {open, globalKey, onClose};
}

/**
 * Local copy of `fumadocs-ui/components/banner` so the close button's
 * `aria-label` can be sourced from paraglide (`m.closeBanner`).
 */
export function Banner({
  id,
  variant = "normal",
  changeLayout = true,
  height = "3rem",
  rainbowColors = DEFAULT_RAINBOW_COLORS,
  ...props
}: BannerProps) {
  const {open, globalKey, onClose} = useBannerState(id);

  if (!open) return null;

  return (
    <div
      id={id}
      {...props}
      className={cn(
        "sticky top-0 z-40 flex flex-row items-center justify-center px-4 text-center text-sm font-medium",
        variant === "normal" && "bg-fd-secondary",
        variant === "rainbow" && "bg-fd-background",
        props.className
      )}
      style={{height}}
    >
      <BannerHeadStyles globalKey={globalKey} height={height} id={id} changeLayout={changeLayout} open={open} />
      {variant === "rainbow" ? <RainbowFlow colors={rainbowColors} /> : null}
      {props.children}
      {id ? <BannerCloseButton onClose={onClose} /> : null}
    </div>
  );
}

const maskImage =
  "linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)";

function RainbowFlow({colors}: {colors: string[]}) {
  return (
    <Fragment>
      <div
        className="absolute inset-0 -z-1"
        style={{
          maskImage,
          maskComposite: "intersect",
          animation: "fd-moving-banner 20s linear infinite",
          backgroundImage: `repeating-linear-gradient(70deg, ${[...colors, colors[0]]
            .map((color, i) => `${color} ${(i * 50) / colors.length}%`)
            .join(", ")})`,
          backgroundSize: "200% 100%",
          filter: "saturate(2)",
        }}
      />
      <style>{`@keyframes fd-moving-banner {
            from { background-position: 0% 0;  }
            to { background-position: 100% 0;  }
         }`}</style>
    </Fragment>
  );
}

function encodeBase32(str: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let encoded = "";
  let buffer = 0;
  let bitsLeft = 0;
  for (let i = 0; i < str.length; i++) {
    buffer = (buffer << 8) | str.charCodeAt(i);
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      bitsLeft -= 5;
      encoded += alphabet[(buffer >> bitsLeft) & 31];
    }
  }
  if (bitsLeft > 0) {
    encoded += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  return encoded;
}
