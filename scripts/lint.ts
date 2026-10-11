import fs from "node:fs/promises";
import path from "node:path";
import {type FileObject, printErrors, validateFiles, type ScanResult} from "next-validate-link";

interface DocFile {
  path: string;
  content: string;
  url: string;
}

function normalizeHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`*_~()[\]{}<>!?.,:;"'|/\\]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(markdown: string): string[] {
  const cleaned = markdown.replace(/```[\s\S]*?```/g, "");
  const counts = new Map<string, number>();
  const headings: string[] = [];
  const regex = /^#{1,6}\s+(.+)$/gm;

  for (const match of cleaned.matchAll(regex)) {
    const heading = normalizeHeading(match[1] ?? "");
    if (!heading) continue;

    const count = counts.get(heading) ?? 0;
    counts.set(heading, count + 1);
    headings.push(count === 0 ? heading : `${heading}-${count}`);
  }

  return headings;
}

function toURL(contentPath: string, filePath: string): string {
  const relativePath = path.relative(contentPath, filePath).replaceAll(path.sep, "/");
  const noExt = relativePath.replace(/\.(mdx|md)$/u, "");
  const segments = noExt.split("/").filter(Boolean);
  if (segments.at(-1) === "index") {
    segments.pop();
  }
  return `/${segments.join("/")}`;
}

async function walkMarkdownFiles(contentPath: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".md") && !entry.name.endsWith(".mdx")) continue;
      files.push(fullPath);
    }
  }

  await walk(contentPath);
  return files;
}

async function collectDocs(): Promise<DocFile[]> {
  const contentPath = path.resolve(process.cwd(), "content");
  const files = await walkMarkdownFiles(contentPath);
  const docs = await Promise.all(
    files.map(async (filePath) => ({
      path: filePath,
      content: await fs.readFile(filePath, "utf8"),
      url: toURL(contentPath, filePath),
    }))
  );

  return docs.filter((doc) => doc.url !== "/");
}

function createScannedPages(docs: DocFile[]): ScanResult {
  const urls = new Map<string, {hashes?: string[]}>();
  const languages = new Set<string>();

  for (const doc of docs) {
    const [, lang, ...slugParts] = doc.url.split("/");
    if (lang) languages.add(lang);

    const hashes = extractHeadings(doc.content);
    urls.set(doc.url, hashes.length > 0 ? {hashes} : {});

    if (lang && slugParts.length > 0) {
      urls.set(`${doc.url}.md`, {});
      urls.set(`/${lang}/og/${slugParts.join("/")}/image.png`, {});
    }
  }

  urls.set("/", {});
  urls.set("/robots.txt", {});
  urls.set("/sitemap.xml", {});
  for (const lang of languages) {
    urls.set(`/${lang}/llms-full.txt`, {});
    // Redirect routes with no content page (valid at runtime).
    urls.set(`/${lang}/`, {});
    urls.set(`/${lang}/api`, {});
    urls.set(`/api/search/${lang}`, {});
  }

  return {
    urls,
    fallbackUrls: [],
  };
}

async function checkLinks() {
  const docs = await collectDocs();
  const scanned = createScannedPages(docs);
  const files: FileObject[] = docs.map((doc) => ({
    path: doc.path,
    content: doc.content,
    url: doc.url,
  }));

  const results = await validateFiles(files, {
    scanned,
    markdown: {
      components: {
        Card: {attributes: ["href"]},
        Link: {attributes: ["href"]},
      },
    },
    checkRelativePaths: "as-url",
  });

  printErrors(results, true);
}

void checkLinks();
