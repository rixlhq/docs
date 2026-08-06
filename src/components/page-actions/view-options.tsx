"use client";

import {Copy} from "lucide-react";
import {useCallback, useMemo, useState} from "react";
import {ViewOptionsPopover} from "./view-options-popover";
import {OptionButtonItem} from "./option-button-item";
import {OptionLinkItem} from "./option-link-item";
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
    return `Read ${fullMarkdownUrl}, I want to ask questions about it.`;
  }, [fullMarkdownUrl]);

  const chatGptUrl = useMemo(() => {
    return `https://chatgpt.com/?${new URLSearchParams({hints: "search", q: queryString})}`;
  }, [queryString]);

  const claudeUrl = useMemo(() => {
    return `https://claude.ai/new?${new URLSearchParams({q: queryString})}`;
  }, [queryString]);

  return (
    <ViewOptionsPopover open={open} onOpenChange={setOpen}>
      <OptionButtonItem icon={<Copy />} title={m.copyPageTitle()} desc={m.copyPageDesc()} onClick={handleCopyClick} />
      <OptionLinkItem href={chatGptUrl} icon={<OpenAIIcon />} title={m.openInChatGPT()} desc={m.askAboutPage()} />
      <OptionLinkItem href={claudeUrl} icon={<AnthropicIcon />} title={m.openInClaude()} desc={m.askAboutPage()} />
    </ViewOptionsPopover>
  );
}
