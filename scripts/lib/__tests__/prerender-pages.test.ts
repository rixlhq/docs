import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {afterEach, beforeEach, describe, expect, it, vi} from "vite-plus/test";
import {collectDocsPrerenderPages, createOgPrerenderPages, createRedirectPrerenderPages, toStaticPages} from "../prerender-pages";

// The real loader reads or fetches the OpenAPI spec; these tests only need the pages it yields.
vi.mock("../../../src/lib/openapi.server.ts", () => ({openapi: {}}));
vi.mock("fumadocs-openapi/server", () => ({
  openapiSource: vi.fn(async () => ({
    files: [
      {type: "page", path: "__lang__/api/videos/get-videos.mdx"},
      {type: "meta", path: "__lang__/api/videos/meta.json"},
    ],
  })),
}));

let dir: string;

async function file(relativePath: string, content = "") {
  const fullPath = path.join(dir, relativePath);
  await fs.mkdir(path.dirname(fullPath), {recursive: true});
  await fs.writeFile(fullPath, content);
}

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "prerender-"));
});

afterEach(async () => {
  await fs.rm(dir, {recursive: true, force: true});
});

describe("collectDocsPrerenderPages", () => {
  it("lists every doc and API page with its markdown, OG image and llms-full routes", async () => {
    await file("en/home/index.mdx");
    await file("en/home/guide.md");
    await file("en/home/meta.json");
    await file("de/home/ignored.mdx");
    await file("en/index.mdx");

    const pages = await collectDocsPrerenderPages({contentDir: dir, supportedLanguages: ["en"]});

    expect(pages).toEqual({
      docs: ["/en/api/videos/get-videos", "/en/home", "/en/home/guide"],
      markdown: ["/en/api/videos/get-videos.md", "/en/home.md", "/en/home/guide.md"],
      og: ["/en/og/api/videos/get-videos/image.png", "/en/og/home/guide/image.png", "/en/og/home/image.png"],
      llmsFull: ["/en/llms-full.txt"],
    });
  });
});

describe("toStaticPages", () => {
  it("wraps each path as a prerender page", () => {
    expect(toStaticPages(["/a", "/b"])).toEqual([{path: "/a"}, {path: "/b"}]);
  });
});

describe("createOgPrerenderPages", () => {
  it("asks for base64 and writes the decoded image to the output folder", async () => {
    const [page] = createOgPrerenderPages({ogPaths: ["/en/og/home/image.png"], outputDir: dir});
    expect(page?.prerender.headers).toEqual({"x-og-prerender": "base64"});

    await page?.prerender.onSuccess({page: {path: "/en/og/home/image.png"}, html: ` ${Buffer.from("PNG").toString("base64")}\n`});

    expect(await fs.readFile(path.join(dir, "en/og/home/image.png"), "utf8")).toBe("PNG");
  });
});

describe("createRedirectPrerenderPages", () => {
  const html = (target: string) => `<link rel="canonical" href="https://developers.rixl.com${target}">`;

  it("replaces each redirect page with a sorted 307 rule in _redirects", async () => {
    await file("index.html");
    await file("en/api.html");
    const [root, api] = createRedirectPrerenderPages({paths: ["/", "/en/api"], outputDir: dir});

    await api?.prerender.onSuccess({page: {path: "/en/api"}, html: html("/en/api/videos")});
    await root?.prerender.onSuccess({page: {path: "/"}, html: html("/en/home")});

    expect(await fs.readFile(path.join(dir, "_redirects"), "utf8")).toBe("/ /en/home 307\n/en/api /en/api/videos 307\n");
    await expect(fs.access(path.join(dir, "index.html"))).rejects.toThrow();
    await expect(fs.access(path.join(dir, "en/api.html"))).rejects.toThrow();
  });

  it("fails when the page it landed on has no canonical link", async () => {
    const [page] = createRedirectPrerenderPages({paths: ["/"], outputDir: dir});
    await expect(page?.prerender.onSuccess({page: {path: "/"}, html: "<html></html>"})).rejects.toThrow(
      "Redirect page / has no canonical target"
    );
  });
});
