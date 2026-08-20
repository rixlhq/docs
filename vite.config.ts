import path from "node:path";
import {paraglideVitePlugin} from "@inlang/paraglide-js";
import {defineConfig} from "vite";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import {extractIconsPlugin} from "./plugins/vite-plugin-extract-icons.ts";
import {i18n} from "./src/lib/i18n.ts";
import {collectDocsPrerenderPages, createOgPrerenderPages, toStaticPages} from "./scripts/lib/prerender-pages.ts";

// import { nitro } from 'nitro/vite'

const docsPrerenderPages = await collectDocsPrerenderPages({
  contentDir: path.resolve(import.meta.dirname, "content"),
  supportedLanguages: i18n.languages,
});
const ogOutputDir = path.resolve(import.meta.dirname, "dist/client");
const ogPrerenderPages = createOgPrerenderPages({
  ogPaths: docsPrerenderPages.og,
  outputDir: ogOutputDir,
});
const staticDocsPages = toStaticPages(docsPrerenderPages.docs);
const staticMarkdownPages = toStaticPages(docsPrerenderPages.markdown);
const staticLLMSPages = toStaticPages(docsPrerenderPages.llmsFull);
const sectionRootRedirectPages = i18n.languages.flatMap((lang) => [
  {path: `/${lang}/home`},
  {path: `/${lang}/sdk`},
  {path: `/${lang}/api`},
]);

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      // `url` first: the `$lang` route segment is the source of truth for a docs
      // page. The rest are fallbacks for non-localized entry points, cheapest
      // lookup first (memory, then cookie).
      strategy: ["url", "globalVariable", "cookie", "baseLocale"],
    }),
    extractIconsPlugin(),
    mdx(await import("./source.config.ts")),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: false,
          autoSubfolderIndex: false,
        },
      },
      prerender: {
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: false,
      },
      router: {
        quoteStyle: "double",
      },
      pages: [
        {
          path: "/",
        },
        {
          path: "/api/search",
        },
        {
          path: "/robots.txt",
        },
        {
          path: "/sitemap.xml",
        },
        ...sectionRootRedirectPages,
        ...staticDocsPages,
        ...staticMarkdownPages,
        ...ogPrerenderPages,
        ...staticLLMSPages,
      ],
    }),
    react({compiler: true}),
  ],
  resolve: {
    alias: {
      "@/snippets": `${import.meta.dirname}/src/components/mdx`,
    },
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: ["xml-js/lib/js2xml"],
  },
  ssr: {
    noExternal: ["@rixl/media-react"],
  },
});
