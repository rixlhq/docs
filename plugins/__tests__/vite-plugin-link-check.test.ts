import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {afterEach, beforeEach, describe, expect, it, vi} from "vite-plus/test";
import {linkCheckPlugin} from "../vite-plugin-link-check";

let root: string;

async function page(relativePath: string, content: string) {
  const file = path.join(root, "content", relativePath);
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, content);
}

function checkLinks(): Promise<void> {
  const hook = linkCheckPlugin().buildStart;
  // The plugin defines buildStart as a plain function and never reads the Rollup context.
  return (hook as () => Promise<void>)();
}

describe("linkCheckPlugin", () => {
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "link-check-"));
    vi.spyOn(process, "cwd").mockReturnValue(root);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(root, {recursive: true, force: true});
  });

  it("runs only at build time", () => {
    expect(linkCheckPlugin().apply).toBe("build");
  });

  it("accepts links to pages, headings, repeated headings and generated routes", async () => {
    await page("en/home/index.mdx", "# Home\n\n## Setup\n\n## Setup\n");
    await page(
      "en/home/guide.mdx",
      [
        "# Guide",
        "[home](/en/home) [setup](/en/home#setup) [second setup](/en/home#setup-1)",
        "[markdown](/en/home/guide.md) [image](/en/og/home/guide/image.png)",
        "[llms](/en/llms-full.txt) [api](/en/api) [search](/api/search/en) [sitemap](/sitemap.xml)",
        '<Card href="/en/home" />',
      ].join("\n")
    );

    await expect(checkLinks()).resolves.toBeUndefined();
  });

  it("ignores headings inside code blocks", async () => {
    await page("en/home/index.mdx", "# Home\n\n```md\n## Not a heading\n```\n");
    await page("en/home/guide.mdx", "[bad](/en/home#not-a-heading)");

    await expect(checkLinks()).rejects.toThrow("Broken internal links found in 1 file(s).");
  });

  it("fails the build on a link to a missing page or heading", async () => {
    await page("en/home/index.mdx", "# Home");
    await page("en/home/guide.mdx", "[missing](/en/home/nope)");
    await page("en/home/other.mdx", '<Card href="/en/home#nope" />');

    await expect(checkLinks()).rejects.toThrow("Broken internal links found in 2 file(s).");
  });
});
