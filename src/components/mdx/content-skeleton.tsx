import {DocsBody, DocsDescription, DocsPage, DocsTitle} from "fumadocs-ui/page";

const LINE_WIDTHS = ["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3", "w-full", "w-5/6", "w-3/4"];

/**
 * Shown in the content area while a page's MDX chunk downloads. The route
 * commits immediately, so the URL, sidebar and nav switch at once; the title
 * and description come from loader data, and only the body is a placeholder.
 * Same DocsPage container as DocsContent, so nothing shifts when it resolves.
 */
export function ContentSkeleton({title, description}: {title: string; description?: string}) {
  return (
    <DocsPage
      className="pt-6 md:pt-8 xl:pt-10 md:px-7 xl:px-10"
      full={false}
      toc={[]}
      breadcrumb={{enabled: false}}
      footer={{enabled: false}}
    >
      {/* Holds the breadcrumb's row so the title does not jump on resolve. */}
      <div className="h-5 w-16 animate-pulse rounded bg-fd-muted" />
      <header className="relative space-y-2">
        <DocsTitle>{title}</DocsTitle>
        {description ? <DocsDescription>{description}</DocsDescription> : null}
      </header>
      <DocsBody>
        <div className="not-prose flex flex-col gap-3" aria-busy="true" aria-live="polite">
          {LINE_WIDTHS.map((width, i) => (
            <div key={i} className={`h-4 animate-pulse rounded bg-fd-muted ${width}`} />
          ))}
        </div>
      </DocsBody>
    </DocsPage>
  );
}
