import type {ReactNode} from "react";
import type {MethodWithPath, OpenApiRenderContext, RequestMediaTypeLite} from "./types";
import {buildRenderedSchemaProperties, getRequestExample, renderSchemaProperties} from "./schema-utils";

type RenderedRequestSection = {
  mediaType: string;
  renderedExample: ReactNode;
  properties: Awaited<ReturnType<typeof buildRenderedSchemaProperties>>;
};

async function buildRequestSection(mediaType: string, media: RequestMediaTypeLite, ctx: OpenApiRenderContext): Promise<RenderedRequestSection> {
  const example = getRequestExample(media);
  const renderedExample = example === undefined ? null : await ctx.renderCodeBlock("json", JSON.stringify(example, null, 2));
  const properties = await buildRenderedSchemaProperties(media.schema, ctx);

  return {
    mediaType,
    renderedExample,
    properties,
  };
}

async function buildRequestSections(mediaEntries: Array<[string, RequestMediaTypeLite]>, ctx: OpenApiRenderContext) {
  return Promise.all(mediaEntries.map(([mediaType, media]) => buildRequestSection(mediaType, media, ctx)));
}

export async function renderStaticRequestBodySection(operation: MethodWithPath, ctx: OpenApiRenderContext) {
  const requestBody = operation.requestBody;
  const mediaEntries = Object.entries(requestBody?.content ?? {});
  if (mediaEntries.length === 0) return null;

  const mediaSections = await buildRequestSections(mediaEntries, ctx);

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight my-0">Request Body</h2>
        {requestBody?.required ? <span className="text-xs text-fd-muted-foreground">required</span> : null}
      </div>

      {mediaSections.map((section) => (
        <div key={section.mediaType} className="space-y-4">
          <code className="text-xs text-fd-muted-foreground">{section.mediaType}</code>
          {section.renderedExample}
          {section.properties.length > 0 ? <div className="flex flex-col">{renderSchemaProperties(section.properties, section.mediaType)}</div> : null}
        </div>
      ))}
    </section>
  );
}
