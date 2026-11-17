import {afterEach, describe, expect, test} from "vite-plus/test";
import {render} from "vitest-browser-react";
import {axeViolations, setTheme} from "../../../../test/a11y.ts";
import {m} from "@/paraglide/messages";
import {LLMCopyButton} from "../llm-copy-button";

afterEach(() => {
  setTheme("light");
});

describe.each(["light", "dark"] as const)("%s theme", (theme) => {
  test("LLM copy button group with closed options menu", async () => {
    setTheme(theme);
    const screen = await render(<LLMCopyButton markdownUrl="/en/home.md" githubUrl="https://github.com/rixlhq/docs" />);

    expect(await axeViolations(screen.container)).toEqual([]);
  });

  test("copy and view-options actions share a labelled group", async () => {
    setTheme(theme);
    const screen = await render(<LLMCopyButton markdownUrl="/en/home.md" githubUrl="https://github.com/rixlhq/docs" />);

    const group = screen.container.querySelector('[role="group"]');
    expect(group?.getAttribute("aria-label")).toBe(m.copyPageTitle());
  });
});
