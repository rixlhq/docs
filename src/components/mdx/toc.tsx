"use client";

/**
 * Local copy of `fumadocs-ui/layouts/docs/page/slots/toc` so the "On this
 * page" heading and "No Headings" empty-state text render via paraglide
 * (`m.toc`, `m.tocNoHeadings`) instead of the fumadocs translation table.
 *
 * Passed to `<DocsPage tableOfContent={{component: <TableOfContents />}} />`
 * and `<DocsPage tableOfContentPopover={{component: <TableOfContentsPopover />}} />`.
 */
import {ChevronDown, Text} from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "fumadocs-ui/components/ui/collapsible";
import {TOCItem, TOCItems} from "fumadocs-ui/components/toc/default";
import {TOCScrollArea, useItems, useTOCItems} from "fumadocs-ui/components/toc";
import {useTreePath} from "fumadocs-ui/contexts/tree";
import {m} from "@/paraglide/messages";
import {cn} from "@/lib/cn";

type TOCProps = {
  container?: ComponentProps<"div">;
  header?: ReactNode;
  footer?: ReactNode;
};

function TOCEmpty() {
  return (
    <div className="rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground">{m.tocNoHeadings()}</div>
  );
}

export function TableOfContents({container, header, footer}: TOCProps) {
  const items = useTOCItems();

  if (items.length === 0 && !header && !footer) {
    return <div id="nd-toc-placeholder" className="hidden xl:layout:[--fd-toc-width:268px]" />;
  }

  return (
    <div
      id="nd-toc"
      {...container}
      className={cn(
        "sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden",
        container?.className
      )}
    >
      {header}
      <h3 id="toc-title" className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
        <Text className="size-4" />
        {m.toc()}
      </h3>
      <TOCScrollArea>
        <TOCItems>
          {items.length === 0 && <TOCEmpty />}
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </TOCScrollArea>
      {footer}
    </div>
  );
}

type TOCPopoverProps = TOCProps & {
  trigger?: ComponentProps<"button">;
  content?: ComponentProps<"div">;
};

type PopoverCtx = {open: boolean; setOpen: (v: boolean) => void};
const TocPopoverContext = createContext<PopoverCtx | null>(null);

function usePopoverCtx(): PopoverCtx {
  const ctx = use(TocPopoverContext);
  if (!ctx) throw new Error("TocPopoverContext missing");
  return ctx;
}

function useClickOutside(open: boolean, ref: React.RefObject<HTMLElement | null>, setOpen: (v: boolean) => void) {
  const onClickOutside = useEffectEvent((e: MouseEvent) => {
    if (!open || !(e.target instanceof HTMLElement)) return;
    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  });
  useEffect(() => {
    window.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("click", onClickOutside);
    };
    // onClickOutside is a stable useEffectEvent handle; excluded per React docs.
  }, []);
}

export function TableOfContentsPopover({container, trigger, content, header, footer}: TOCPopoverProps) {
  const items = useTOCItems();
  const ref = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  // Upstream reads `isNavTransparent` from `useDocsLayout()` to decide the
  // header background — that hook is not exported publicly, and our layout
  // config keeps the nav opaque, so we always apply the solid background.
  const isNavTransparent = false;
  useClickOutside(open, ref, setOpen);

  const value = useMemo(() => ({open, setOpen}), [open]);

  return (
    <TocPopoverContext value={value}>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-toc-popover=""
        {...container}
        className={cn(
          "sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]",
          container?.className
        )}
      >
        <header
          ref={ref}
          className={cn(
            "border-b backdrop-blur-sm transition-colors",
            (!isNavTransparent || open) && "bg-fd-background/80",
            open && "shadow-lg"
          )}
        >
          <TOCPopoverTrigger {...trigger} />
          <TOCPopoverContent {...content}>
            {header}
            <TOCScrollArea>
              <TOCItems>
                {items.length === 0 && <TOCEmpty />}
                {items.map((item) => (
                  <TOCItem key={item.url} item={item} onClick={() => setOpen(false)} />
                ))}
              </TOCItems>
            </TOCScrollArea>
            {footer}
          </TOCPopoverContent>
        </header>
      </Collapsible>
    </TocPopoverContext>
  );
}

function TOCPopoverTrigger({className, ...props}: ComponentProps<"button">) {
  const {open} = usePopoverCtx();
  const items = useItems();
  const selectedIdx = items.findIndex((item) => item.active);
  const path = useTreePath().at(-1);
  const showItem = selectedIdx !== -1 && !open;
  const progress = (items.findLastIndex((item) => item.active) + 1) / Math.max(1, items.length);

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6",
        className
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      <ProgressCircle value={progress} max={1} className={cn("shrink-0", open && "text-fd-primary")} />
      <span className="grid flex-1 *:my-auto *:row-start-1 *:col-start-1">
        <span
          className={cn(
            "truncate transition-[opacity,translate,color]",
            open && "text-fd-foreground",
            showItem && "opacity-0 -translate-y-full pointer-events-none"
          )}
        >
          {path?.name ?? m.toc()}
        </span>
        <span
          className={cn(
            "truncate transition-[opacity,translate]",
            !showItem && "opacity-0 translate-y-full pointer-events-none"
          )}
        >
          {items[selectedIdx]?.original.title}
        </span>
      </span>
      <ChevronDown className={cn("shrink-0 transition-transform mx-0.5", open && "rotate-180")} />
    </CollapsibleTrigger>
  );
}

function TOCPopoverContent(props: ComponentProps<"div">) {
  return (
    <CollapsibleContent data-toc-popover-content="" {...props}>
      <div className="flex flex-col px-4 max-h-[50vh] md:px-6">{props.children}</div>
    </CollapsibleContent>
  );
}

function clamp(input: number, min: number, max: number) {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}

type ProgressCircleProps = Omit<ComponentProps<"svg">, "value" | "max"> & {
  value: number;
  max?: number;
  min?: number;
  strokeWidth?: number;
  size?: number;
};

function ProgressCircle({
  value,
  strokeWidth = 1.5,
  size = 18,
  min = 0,
  max = 100,
  style,
  ...rest
}: ProgressCircleProps) {
  const normalized = clamp(value, min, max);
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalized / max) * circumference;
  const circleProps = {cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth};

  // Custom SVG progress indicator; `<progress>` doesn't fit the visual, so we
  // annotate the SVG with the progressbar role instead.
  const svgProps = {
    role: "progressbar",
    "aria-valuenow": normalized,
    "aria-valuemin": min,
    "aria-valuemax": max,
  } as const;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{width: size, height: size, ...style}}
      {...svgProps}
      {...rest}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  );
}
