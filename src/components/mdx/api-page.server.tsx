import "@tanstack/react-start/server-only";
import type {HTMLAttributes} from "react";
import {createOpenAPIPage} from "fumadocs-openapi/ui";
import {highlight} from "fumadocs-core/highlight";
import {CodeBlock, Pre} from "@/components/mdx/codeblock";
import {renderStaticExampleTabs} from "@/components/mdx/api-page/render-static-example-tabs";
import {renderStaticRequestBodySection} from "@/components/mdx/api-page/render-static-request-body";
import {renderStaticResponseSection} from "@/components/mdx/api-page/render-static-response-section";
import {findOperationPath} from "@/components/mdx/api-page/path-utils";
import type {MethodWithPath, OpenApiRenderContext, PathItemLite} from "@/components/mdx/api-page/types";

// v11 exposes a single render context to content hooks. Adapt it to the project's
// static-render context: markdown via the built-in processor, code via fumadocs' Shiki
// highlighter, and the dereferenced schema directly (no longer nested under `.dereferenced`).
/**
 * Renders highlighted code through the same CodeBlock the MDX `pre` mapping
 * uses.
 *
 * Shiki writes the light theme as real declarations and the dark one as
 * `--shiki-dark*` custom properties. Fumadocs' stylesheet only reads those back
 * for `color` and `font-style`; the dark *background* is applied by CodeBlock
 * itself. Handing back a bare `<pre>` therefore left Shiki's inline light
 * background painted white behind dark-theme text.
 *
 * The tabs renderer already assumed this, styling `[&>figure:only-child]` —
 * the figure CodeBlock renders.
 */
const codeBlockComponents = {
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <CodeBlock {...props}>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  ),
};

export const APIPage = createOpenAPIPage({
  playground: {
    enabled: false,
  },
  showResponseSchema: false,
  content: {
    async renderOperationLayout(slots, {operation, method, pathItem, ctx}) {
      const typedCtx: OpenApiRenderContext = {
        schema: ctx.schema.dereferenced,
        mediaAdapters: ctx.mediaAdapters,
        renderMarkdown: (md) => ctx._default_processMarkdown(md),
        // defaultColor is forced off rather than left to fumadocs' defaults:
        // applyDefaultThemes returns the options untouched once `themes` is
        // present, and fumadocs-openapi always sets it. Without this Shiki
        // writes the light theme as inline styles, which outrank the
        // `.dark .shiki code span` rule and leave a white block in dark mode.
        renderCodeBlock: (lang, code) => highlight(code, {lang, ...ctx.shikiOptions, defaultColor: false, components: codeBlockComponents}),
      };
      const typedOperation = operation as MethodWithPath;
      const typedPathItem = pathItem as PathItemLite;
      const typedMethod = method as string;
      const path = findOperationPath({ctx: typedCtx, operation: typedOperation, method: typedMethod, headerNode: slots.header});
      const rail = path
        ? await renderStaticExampleTabs({path, operation: typedOperation, method: typedMethod, pathItem: typedPathItem, ctx: typedCtx})
        : slots.apiExample;
      const requestBody = await renderStaticRequestBodySection(typedOperation, typedCtx);
      const responses = await renderStaticResponseSection(typedOperation, typedCtx);

      return (
        <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
          <div className="min-w-0 flex-1">
            {slots.header}
            {slots.apiPlayground}
            {slots.description}
            {slots.authSchemes}
            {slots.parameters}
            {requestBody}
            {responses}
            {slots.callbacks}
          </div>
          <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-2,var(--fd-docs-row-1,2rem))+1rem)] @4xl:w-[400px]">{rail}</div>
        </div>
      );
    },
  },
});
