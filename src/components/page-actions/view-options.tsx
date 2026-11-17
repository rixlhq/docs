"use client";

import {Copy} from "lucide-react";
import {useCallback, useMemo, useState} from "react";
import {DropdownMenuItem} from "@rixl/ui/dropdown-menu";
import {ViewOptionsMenu} from "./view-options-menu";
import {OptionItemContent} from "./option-item-content";
import {OpenAIIcon} from "@/components/page-actions/icons/openai-icon.tsx";
import {AnthropicIcon} from "@/components/page-actions/icons/anthropic-icon.tsx";
import {m} from "@/paraglide/messages";

interface ViewOptionsProps {
  /**
   * A URL to the raw Markdown/MDX content of page
   */
  markdownUrl: string;
  /**
   * Source file URL on GitHub
   */
  githubUrl: string;
  /**
   * Callback when the copy option is clicked
   */
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function ViewOptions({markdownUrl, onClick}: ViewOptionsProps) {
  const [open, setOpen] = useState(false);

  const handleCopyClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      setOpen(false);
    },
    [onClick]
  );

  const fullMarkdownUrl = useMemo(() => {
    return typeof window !== "undefined" ? new URL(markdownUrl, window.location.origin).toString() : markdownUrl;
  }, [markdownUrl]);

  const queryString = useMemo(() => {
    return m.askAboutPageQuery({url: fullMarkdownUrl});
  }, [fullMarkdownUrl]);

  const chatGptUrl = useMemo(() => {
    return `https://chatgpt.com/?${new URLSearchParams({hints: "search", q: queryString})}`;
  }, [queryString]);

  const claudeUrl = useMemo(() => {
    return `https://claude.ai/new?${new URLSearchParams({q: queryString})}`;
  }, [queryString]);

  return (
    <ViewOptionsMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuItem render={<button type="button" aria-label={m.copyPageTitle()} onClick={handleCopyClick} />}>
        <OptionItemContent icon={<Copy />} title={m.copyPageTitle()} desc={m.copyPageDesc()} />
      </DropdownMenuItem>
      <DropdownMenuItem render={<a href={chatGptUrl} rel="noreferrer noopener" target="_blank" aria-label={m.openInChatGPT()} />}>
        <OptionItemContent icon={<OpenAIIcon />} title={m.openInChatGPT()} desc={m.askAboutPage()} href={chatGptUrl} />
      </DropdownMenuItem>
      <DropdownMenuItem render={<a href={claudeUrl} rel="noreferrer noopener" target="_blank" aria-label={m.openInClaude()} />}>
        <OptionItemContent icon={<AnthropicIcon />} title={m.openInClaude()} desc={m.askAboutPage()} href={claudeUrl} />
      </DropdownMenuItem>
    </ViewOptionsMenu>
  );
}
