"use client";

import {useState} from "react";
import {useCopyButton} from "fumadocs-ui/utils/use-copy-button";
import {ButtonGroup} from "@rixl/ui/button-group";
import {m} from "@/paraglide/messages";
import {CopyButton} from "./copy-button";
import {ViewOptions} from "./view-options";

const cache = new Map<string, string>();

export interface LLMCopyButtonProps {
  /**
   * A URL to fetch the raw Markdown/MDX content of page
   */
  markdownUrl: string;
  /**
   * Source file URL on GitHub
   */
  githubUrl: string;
}

export function LLMCopyButton({markdownUrl, githubUrl}: LLMCopyButtonProps) {
  const [isLoading, setLoading] = useState(false);
  const [checked, onClick] = useCopyButton(async () => {
    const cached = cache.get(markdownUrl);
    if (cached) return navigator.clipboard.writeText(cached);

    setLoading(true);

    // `Promise.finally` instead of `try`/`finally`: the latter is unsupported
    // by React Compiler and opts this component out of optimization.
    await navigator.clipboard
      .write([
        new ClipboardItem({
          "text/plain": fetch(markdownUrl).then(async (res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch Markdown: ${res.status}`);
            }

            const content = await res.text();
            if (content.trim().startsWith("<!DOCTYPE") || content.trim().startsWith("<html")) {
              throw new Error("Markdown endpoint returned HTML");
            }

            cache.set(markdownUrl, content);
            return content;
          }),
        }),
      ])
      .finally(() => setLoading(false));
  });

  return (
    <ButtonGroup aria-label={m.copyPageTitle()} className="rounded-lg border">
      <CopyButton isLoading={isLoading} checked={checked} onClick={onClick} />
      <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} onClick={onClick} />
    </ButtonGroup>
  );
}
