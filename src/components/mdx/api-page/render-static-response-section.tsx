import {ChevronRight} from "lucide-react";
import type {ReactElement, ReactNode} from "react";
import type {MethodWithPath, OpenApiRenderContext, ResponseMediaTypeLite, ResponseObjectLite, SchemaLite} from "./types";
import {
  buildRenderedSchemaProperties,
  collectResponseExamples,
  normalizeResponseSample,
  renderSchemaProperties,
  schemaTypeLabel,
} from "./schema-utils";

type MediaBlock = {
  mediaType: string;
  rootType: string | null;
  properties: Awaited<ReturnType<typeof buildRenderedSchemaProperties>>;
  exampleNode: ReactNode;
};

type MediaBlockInput = {
  status: string;
  response: ResponseObjectLite;
  mediaType: string;
  media: ResponseMediaTypeLite;
  ctx: OpenApiRenderContext;
};

async function buildMediaBlock({status, response, mediaType, media, ctx}: MediaBlockInput): Promise<MediaBlock> {
  const properties = await buildRenderedSchemaProperties(media.schema as SchemaLite | undefined, ctx);
  let exampleNode: ReactNode = null;

  if (properties.length === 0) {
    const [example] = collectResponseExamples(media);
    if (example) {
      exampleNode = await ctx.renderCodeBlock(
        "json",
        JSON.stringify(normalizeResponseSample(example.sample, status, response.description), null, 2)
      );
    }
  }

  return {
    mediaType,
    rootType: media.schema ? schemaTypeLabel(media.schema as SchemaLite) : null,
    properties,
    exampleNode,
  };
}

type MediaBlocksInput = {
  status: string;
  response: ResponseObjectLite;
  mediaEntries: Array<[string, ResponseMediaTypeLite]>;
  ctx: OpenApiRenderContext;
};

async function buildMediaBlocks({status, response, mediaEntries, ctx}: MediaBlocksInput): Promise<MediaBlock[]> {
  return Promise.all(mediaEntries.map(([mediaType, media]) => buildMediaBlock({status, response, mediaType, media, ctx})));
}

function MediaBlockContent({
  status,
  mediaEntries,
  mediaBlock,
}: {
  status: string;
  mediaEntries: Array<[string, ResponseMediaTypeLite]>;
  mediaBlock: MediaBlock;
}) {
  return (
    <div key={`${status}:${mediaBlock.mediaType}`} className="space-y-3">
      {mediaEntries.length > 1 ? <p className="text-xs font-mono text-fd-muted-foreground">{mediaBlock.mediaType}</p> : null}
      {mediaBlock.rootType ? <p className="text-xs font-mono text-fd-muted-foreground">type: {mediaBlock.rootType}</p> : null}
      {mediaBlock.properties.length > 0 ? (
        <div className="flex flex-col">{renderSchemaProperties(mediaBlock.properties, `${status}:${mediaBlock.mediaType}`)}</div>
      ) : mediaBlock.exampleNode ? (
        mediaBlock.exampleNode
      ) : (
        <p className="text-sm text-fd-muted-foreground">No response body.</p>
      )}
    </div>
  );
}

async function renderResponseEntry(status: string, response: ResponseObjectLite, ctx: OpenApiRenderContext): Promise<ReactElement> {
  const descriptionNode = response.description ? await ctx.renderMarkdown(response.description) : null;
  const mediaEntries = Object.entries(response.content ?? {});
  const mediaBlocks = await buildMediaBlocks({status, response, mediaEntries, ctx});

  return (
    <details key={status} className="group scroll-m-20 border-b border-fd-border py-2">
      <summary className="not-prose flex list-none cursor-pointer items-center justify-between gap-2 py-1 font-mono text-fd-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-fd-muted-foreground transition-transform group-open:rotate-90" />
          {status}
        </span>
        {mediaEntries.length === 1 ? <code className="text-xs text-fd-muted-foreground">{mediaEntries[0]?.[0]}</code> : null}
      </summary>
      <div className="prose-no-margin space-y-4 pt-2 ps-4">
        {descriptionNode}
        {mediaBlocks.map((mediaBlock) => (
          <MediaBlockContent
            key={`${status}:${mediaBlock.mediaType}`}
            status={status}
            mediaEntries={mediaEntries}
            mediaBlock={mediaBlock}
          />
        ))}
      </div>
    </details>
  );
}

export async function renderStaticResponseSection(operation: MethodWithPath, ctx: OpenApiRenderContext) {
  const responseEntries = Object.entries(operation.responses ?? {});
  if (responseEntries.length === 0) return null;

  const sections = await Promise.all(responseEntries.map(([status, response]) => renderResponseEntry(status, response, ctx)));

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight mb-2">Response Body</h2>
      <div className="divide-y divide-fd-border">{sections}</div>
    </section>
  );
}
