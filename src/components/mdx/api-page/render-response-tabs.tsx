import {CodeBlockTabsList, CodeBlockTabsTrigger} from "@/components/mdx/codeblock";
import {Tab, Tabs} from "fumadocs-ui/components/tabs";
import type {ReactNode} from "react";
import type {OpenApiRenderContext, ResponseTab} from "./types";
import {normalizeResponseSample} from "./schema-utils";

type RenderContext = Pick<OpenApiRenderContext, "renderCodeBlock" | "renderMarkdown">;

type RenderedExample = {
  label?: string;
  description?: string;
  code: ReactNode;
};

type ResponsePanel = {
  code: string;
  mediaType?: string;
  description?: string;
  examples: RenderedExample[];
};

async function renderExample(tab: ResponseTab, example: {sample: unknown; label?: string; description?: string}, ctx: RenderContext) {
  const code = await ctx.renderCodeBlock(
    "json",
    JSON.stringify(normalizeResponseSample(example.sample, tab.code, tab.response.description), null, 2)
  );

  return {
    label: example.label,
    description: example.description,
    code,
  };
}

async function buildPanel(tab: ResponseTab, ctx: RenderContext): Promise<ResponsePanel> {
  const examples = tab.examples ?? [];
  const renderedExamples = await Promise.all(examples.map((example) => renderExample(tab, example, ctx)));

  return {
    code: tab.code,
    mediaType: tab.mediaType,
    description: tab.response.description,
    examples: renderedExamples,
  };
}

async function buildPanels(tabs: ResponseTab[], ctx: RenderContext): Promise<ResponsePanel[]> {
  return Promise.all(tabs.map((tab) => buildPanel(tab, ctx)));
}

function ExampleContent({example, showLabel, ctx}: {example: RenderedExample; showLabel: boolean; ctx: RenderContext}) {
  return (
    <div className="space-y-2">
      {showLabel ? <p className="text-xs font-medium text-fd-muted-foreground">{example.label}</p> : null}
      {example.description ? (
        <div className="prose-no-margin text-xs text-fd-muted-foreground">{ctx.renderMarkdown(example.description)}</div>
      ) : null}
      {example.code}
    </div>
  );
}

function ExamplesBlock({panel, ctx}: {panel: ResponsePanel; ctx: RenderContext}) {
  if (panel.examples.length === 0) {
    return panel.description ? null : <p className="text-sm text-fd-muted-foreground">No response body.</p>;
  }

  const showLabel = panel.examples.length > 1;
  return (
    <div className="space-y-4">
      {panel.examples.map((example, index) => (
        <ExampleContent key={`${panel.code}:${index}`} example={example} showLabel={showLabel} ctx={ctx} />
      ))}
    </div>
  );
}

function ResponsePanelContent({panel, ctx}: {panel: ResponsePanel; ctx: RenderContext}) {
  return (
    <Tab key={panel.code} value={panel.code} className="p-4 space-y-4 bg-fd-background rounded-none data-[state=inactive]:hidden">
      {panel.description ? <div className="prose-no-margin text-sm">{ctx.renderMarkdown(panel.description)}</div> : null}
      {panel.mediaType ? <p className="text-xs text-fd-muted-foreground font-mono">{panel.mediaType}</p> : null}
      <ExamplesBlock panel={panel} ctx={ctx} />
    </Tab>
  );
}

export async function renderResponseTabs(tabs: ResponseTab[], ctx: RenderContext) {
  if (tabs.length === 0) return null;

  const panels = await buildPanels(tabs, ctx);
  const defaultValue = panels[0]?.code ?? "";

  return (
    <Tabs groupId="fumadocs_openapi_responses" defaultValue={defaultValue} className="bg-fd-card rounded-xl border overflow-hidden">
      <CodeBlockTabsList>
        {panels.map((panel) => (
          <CodeBlockTabsTrigger key={panel.code} value={panel.code}>
            {panel.code}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>

      {panels.map((panel) => (
        <ResponsePanelContent key={panel.code} panel={panel} ctx={ctx} />
      ))}
    </Tabs>
  );
}
