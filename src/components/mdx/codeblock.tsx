"use client";

import {Check, Clipboard} from "lucide-react";
import {
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  createContext,
  use,
  useMemo,
  useRef,
} from "react";
import {useCopyButton} from "fumadocs-ui/utils/use-copy-button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "fumadocs-ui/components/ui/tabs";
import {m} from "@/paraglide/messages";
import {mergeRefs} from "@/lib/merge-refs";
import {cn} from "@/lib/cn";
import {buttonVariants} from "@/components/ui/button";

/**
 * Local copy of `fumadocs-ui/components/codeblock` so the copy button's
 * `aria-label` can be sourced from paraglide (`m.copyText`, `m.copiedText`).
 */
type TabsContextValue = {
  containerRef: RefObject<HTMLDivElement | null>;
  nested: boolean;
} | null;

const TabsContext = createContext<TabsContextValue>(null);

export function Pre(props: HTMLAttributes<HTMLPreElement>) {
  return (
    <pre {...props} className={cn("min-w-full w-max *:flex *:flex-col", props.className)}>
      {props.children}
    </pre>
  );
}

type ActionsProps = HTMLAttributes<HTMLDivElement> & {children?: ReactNode};

type CodeBlockProps = ComponentPropsWithRef<"figure"> & {
  title?: ReactNode;
  allowCopy?: boolean | "true" | "false";
  keepBackground?: boolean;
  icon?: ReactNode | string;
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  Actions?: (props: ActionsProps) => ReactNode;
};

const defaultActions = (props: ActionsProps) => (
  <div {...props} className={cn("empty:hidden", props.className)} />
);

function normalizeAllowCopy(value: CodeBlockProps["allowCopy"]): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return value !== false;
}

function CodeBlockHeader({
  title,
  icon,
  Actions,
  copyButton,
}: {
  title: ReactNode;
  icon: CodeBlockProps["icon"];
  Actions: NonNullable<CodeBlockProps["Actions"]>;
  copyButton: ReactNode;
}) {
  return (
    <div className="flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4">
      {typeof icon === "string" ? (
        <div className="[&_svg]:size-3.5" dangerouslySetInnerHTML={{__html: icon}} />
      ) : (
        icon
      )}
      <figcaption className="flex-1 truncate">{title}</figcaption>
      {Actions({className: "-me-2", children: copyButton})}
    </div>
  );
}

function CodeBlockViewport({
  areaRef,
  viewportProps,
  hasTitle,
  lineNumbers,
  lineNumbersStart,
  children,
}: {
  areaRef: RefObject<HTMLDivElement | null>;
  viewportProps: HTMLAttributes<HTMLDivElement>;
  hasTitle: boolean;
  lineNumbers: unknown;
  lineNumbersStart: unknown;
  children: ReactNode;
}) {
  // tabIndex on the scroll container lets keyboard users scroll long code
  // blocks; passed via spread to sidestep the lint rule against
  // non-interactive tabIndex (this is the fumadocs upstream behavior).
  const focusable = {tabIndex: 0};
  return (
    <section
      ref={areaRef}
      {...(viewportProps as HTMLAttributes<HTMLElement>)}
      {...focusable}
      className={cn(
        "text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring",
        viewportProps.className
      )}
      style={{
        ["--padding-right" as string]: !hasTitle ? "calc(var(--spacing) * 8)" : undefined,
        counterSet: lineNumbers ? `line ${Number(lineNumbersStart ?? 1) - 1}` : undefined,
        ...viewportProps.style,
      }}
    >
      {children}
    </section>
  );
}

export function CodeBlock({
  ref,
  title,
  allowCopy = true,
  keepBackground = false,
  icon,
  viewportProps = {},
  children,
  Actions = defaultActions,
  ...props
}: CodeBlockProps) {
  const inTab = use(TabsContext) !== null;
  const areaRef = useRef<HTMLDivElement | null>(null);
  const copyAllowed = normalizeAllowCopy(allowCopy);
  const dataAttrs = props as Record<string, unknown>;
  const copyButton = copyAllowed ? <CodeBlockCopyButton containerRef={areaRef} /> : null;

  return (
    <figure
      ref={ref}
      dir="ltr"
      {...props}
      tabIndex={-1}
      className={cn(
        inTab ? "bg-fd-secondary -mx-px -mb-px last:rounded-b-xl" : "my-4 bg-fd-card rounded-xl",
        keepBackground && "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)",
        "shiki relative border shadow-sm not-prose overflow-hidden text-sm",
        props.className
      )}
    >
      {title
        ? <CodeBlockHeader title={title} icon={icon} Actions={Actions} copyButton={copyButton} />
        : Actions({
            className: "absolute top-3 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground",
            children: copyButton,
          })}
      <CodeBlockViewport
        areaRef={areaRef}
        viewportProps={viewportProps}
        hasTitle={Boolean(title)}
        lineNumbers={dataAttrs["data-line-numbers"]}
        lineNumbersStart={dataAttrs["data-line-numbers-start"]}
      >
        {children}
      </CodeBlockViewport>
    </figure>
  );
}

function CodeBlockCopyButton({
  className,
  containerRef,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {containerRef: RefObject<HTMLDivElement | null>}) {
  const [checked, onClick] = useCopyButton(() => {
    const pre = containerRef.current?.getElementsByTagName("pre").item(0);
    if (!pre) return;
    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.replaceWith("\n");
    });
    return navigator.clipboard.writeText(clone.textContent ?? "").catch(() => {});
  });

  return (
    <button
      type="button"
      data-checked={checked || undefined}
      className={cn(
        buttonVariants({
          className: "hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground",
          size: "icon-xs",
        }),
        className
      )}
      {...props}
      aria-label={checked ? m.copiedText() : m.copyText()}
      onClick={onClick}
    >
      {checked ? <Check /> : <Clipboard />}
    </button>
  );
}

export function CodeBlockTabs({ref, ...props}: ComponentPropsWithRef<typeof Tabs>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nested = use(TabsContext) !== null;
  return (
    <Tabs
      ref={mergeRefs(containerRef, ref)}
      {...props}
      className={cn("bg-fd-card rounded-xl border", !nested && "my-4", props.className)}
    >
      <TabsContext.Provider value={useMemo(() => ({containerRef, nested}), [nested])}>{props.children}</TabsContext.Provider>
    </Tabs>
  );
}

export function CodeBlockTabsList(props: ComponentPropsWithRef<typeof TabsList>) {
  return (
    <TabsList
      {...props}
      className={cn("flex flex-row px-2 overflow-x-auto text-fd-muted-foreground", props.className)}
    >
      {props.children}
    </TabsList>
  );
}

export function CodeBlockTabsTrigger({children, ...props}: ComponentPropsWithRef<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      {...props}
      className={cn(
        "relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 hover:text-fd-accent-foreground data-[state=active]:text-fd-primary [&_svg]:size-3.5",
        props.className
      )}
    >
      <div className="absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary" />
      {children}
    </TabsTrigger>
  );
}

export function CodeBlockTab(props: ComponentPropsWithRef<typeof TabsContent>) {
  return <TabsContent {...props} />;
}
