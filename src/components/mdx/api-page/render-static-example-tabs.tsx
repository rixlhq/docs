import {CodeBlockTabsList, CodeBlockTabsTrigger} from "fumadocs-ui/components/codeblock";
import {Tab, Tabs} from "fumadocs-ui/components/tabs";
// @ts-expect-error -- runtime export exists but not in .d.ts
import {getExampleRequests} from "../../../../node_modules/fumadocs-openapi/dist/utils/get-example-requests.js";
import type {CodeUsageGenerator} from "fumadocs-openapi/requests/generators";
import {csharp} from "fumadocs-openapi/requests/generators/csharp";
import {curl} from "fumadocs-openapi/requests/generators/curl";
import {go} from "fumadocs-openapi/requests/generators/go";
import {java} from "fumadocs-openapi/requests/generators/java";
import {javascript} from "fumadocs-openapi/requests/generators/javascript";
import {python} from "fumadocs-openapi/requests/generators/python";
import type {ReactNode} from "react";
import {joinApiUrl, resolveOpenApiBaseUrl} from "@/lib/api-base-url";
import type {ApiServerRoot} from "@/lib/api-base-url";
import {renderResponseTabs} from "./render-response-tabs";
import {collectResponseExamples} from "./schema-utils";
import type {EncodedRequestData, MethodWithPath, OpenApiRenderContext, PathItemLite, ResponseMediaTypeLite, ResponseTab} from "./types";
import {resolveRequestPath} from "./path-utils";

const requestCodeGenerators: CodeUsageGenerator[] = [curl, javascript, go, python, java, csharp];

function pickPreferredMedia(content?: Record<string, ResponseMediaTypeLite>): [string, ResponseMediaTypeLite] | undefined {
  const entries = Object.entries(content ?? {});
  return entries.find(([type]) => type.includes("json")) ?? entries[0];
}

function buildResponseTabs(operation: MethodWithPath): ResponseTab[] {
  return Object.entries(operation.responses ?? {}).map(([code, response]) => {
    const media = pickPreferredMedia(response.content);
    return {
      code,
      mediaType: media?.[0],
      response: {description: response.description},
      examples: media ? collectResponseExamples(media[1]) : [],
    };
  });
}

type RequestTabItem = {
  id: string;
  label: string;
  lang: string;
  code: string;
};

type HighlightedTabItem = RequestTabItem & {
  node: ReactNode;
};

function resolveGeneratorId(generator: CodeUsageGenerator): string {
  if (generator === javascript) return "js";
  if (generator.lang === "bash") return "curl";
  return generator.lang;
}

function buildRequestItems(requestUrl: string, encoded: EncodedRequestData, ctx: OpenApiRenderContext): RequestTabItem[] {
  return requestCodeGenerators.map((generator) => ({
    id: resolveGeneratorId(generator),
    label: generator.label ?? generator.lang,
    lang: generator.lang,
    code: generator.generate({...encoded, url: requestUrl} as Parameters<CodeUsageGenerator["generate"]>[0], {
      mediaAdapters: ctx.mediaAdapters,
      custom: undefined,
    }),
  }));
}

async function highlightRequestItems(items: RequestTabItem[], ctx: OpenApiRenderContext): Promise<HighlightedTabItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      node: await ctx.renderCodeBlock(item.lang, item.code),
    }))
  );
}

function RequestTabs({items}: {items: HighlightedTabItem[]}) {
  return (
    <Tabs groupId="fumadocs_openapi_requests" defaultValue={items[0]?.id} className="bg-fd-card rounded-xl border my-4 overflow-hidden">
      <CodeBlockTabsList>
        {items.map((item) => (
          <CodeBlockTabsTrigger key={item.id} value={item.id}>
            {item.label}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>

      {items.map((item) => (
        <Tab
          key={item.id}
          value={item.id}
          className="p-0 bg-transparent rounded-none outline-none data-[state=inactive]:hidden [&>figure:only-child]:m-0 [&>figure:only-child]:rounded-none [&>figure:only-child]:border-0 [&>figure:only-child]:shadow-none"
        >
          {item.node}
        </Tab>
      ))}
    </Tabs>
  );
}

type RequestUrlInput = {
  path: string;
  operation: MethodWithPath;
  ctx: OpenApiRenderContext;
  encoded: EncodedRequestData;
};

function resolveRequestUrl({path, operation, ctx, encoded}: RequestUrlInput): string {
  const rootSchema = ctx.schema as ApiServerRoot | undefined;
  return joinApiUrl(resolveOpenApiBaseUrl(rootSchema, operation.servers), resolveRequestPath(path, encoded));
}

export async function renderStaticExampleTabs({
  path,
  operation,
  method,
  pathItem,
  ctx,
}: {
  path: string;
  operation: MethodWithPath;
  method: string;
  pathItem: PathItemLite;
  ctx: OpenApiRenderContext;
}) {
  const responseTabs = await renderResponseTabs(buildResponseTabs(operation), ctx);
  const [firstExample] = getExampleRequests({path, operation, method, pathItem, ctx});
  if (!firstExample) return responseTabs;

  const encoded = firstExample.encoded as EncodedRequestData;
  const requestUrl = resolveRequestUrl({path, operation, ctx, encoded});
  const items = buildRequestItems(requestUrl, encoded, ctx);
  const highlightedItems = await highlightRequestItems(items, ctx);

  return (
    <div className="prose-no-margin">
      <RequestTabs items={highlightedItems} />
      {responseTabs}
    </div>
  );
}
