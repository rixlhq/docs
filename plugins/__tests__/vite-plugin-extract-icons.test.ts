import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {afterEach, beforeEach, describe, expect, it, vi} from "vite-plus/test";
import type {ResolvedConfig} from "vite";
import {extractIconsPlugin} from "../vite-plugin-extract-icons";

let root: string;

async function page(relativePath: string, content: string) {
  const file = path.join(root, "content", relativePath);
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, content);
}

async function generate(): Promise<string> {
  const plugin = extractIconsPlugin();
  // Both hooks are plain functions here; configResolved only reads `root`.
  (plugin.configResolved as (config: Pick<ResolvedConfig, "root">) => void)({root});
  (plugin.buildStart as () => void)();
  return fs.readFile(path.join(root, "src/generated/icons.ts"), "utf8");
}

describe("extractIconsPlugin", () => {
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "extract-icons-"));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(root, {recursive: true, force: true});
  });

  it("imports only the Lucide icons the pages use, sorted", async () => {
    await page("en/a.mdx", '<Card icon="video" />\n<Card icon="arrow-right" />');
    await page("en/nested/b.mdx", "<Card icon='video' />");

    const output = await generate();

    expect(output).toContain('import {ArrowRight, Video} from "lucide-react";');
    expect(output).toContain('  "arrow-right": ArrowRight,\n  "video": Video,');
    expect(output).toContain("export type IconName = keyof typeof iconMap;");
  });

  it("writes an empty map when no page uses an icon", async () => {
    await page("en/a.mdx", "# No icons");

    const output = await generate();

    expect(output).toContain("export const iconMap: Record<string, LucideIcon> = {};");
    expect(output).toContain("export type IconName = string;");
  });

  it("warns about an unknown icon with its file and line, and leaves it out", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await page("en/a.mdx", '# Title\n<Card icon="not-an-icon" />');

    const output = await generate();

    expect(warn).toHaveBeenCalledWith(`  ⚠️  Unknown icon "not-an-icon" in ${path.join("content", "en", "a.mdx")}:2`);
    expect(output).not.toContain("not-an-icon");
  });

  it("accepts the custom framework icons without importing them from Lucide", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await page("en/a.mdx", '<Card icon="react" />');

    const output = await generate();

    expect(warn).not.toHaveBeenCalled();
    expect(output).toContain("export const iconMap: Record<string, LucideIcon> = {};");
  });
});
