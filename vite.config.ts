import path from "node:path";
import {paraglideVitePlugin} from "@inlang/paraglide-js";
import {defineConfig, lazyPlugins} from "vite-plus";
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
  fmt: {
    printWidth: 140,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    arrowParens: "always",
    bracketSpacing: false,
    bracketSameLine: false,
    endOfLine: "lf",
  },
  lint: {
    rules: {
      "react/react-in-jsx-scope": "off",
      "typescript/no-explicit-any": "warn",
      "eslint/complexity": [
        "error",
        {
          max: 10,
        },
      ],
      "eslint/max-lines-per-function": [
        "error",
        {
          max: 50,
          skipComments: true,
        },
      ],
      "eslint/max-lines": [
        "error",
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "eslint/max-params": ["error", 3],
      "eslint/max-depth": ["error", 3],
      "eslint/max-statements": ["error", 25],
      "eslint/max-classes-per-file": ["error", 1],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    plugins: ["react", "react-perf", "typescript", "jsx-a11y"],
    ignorePatterns: ["*.html", "docker", "public", "__tests__", "*.test.ts", "routeTree.gen.ts"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  staged: {
    "*.{js,ts,jsx,tsx}": "vp check --fix",
    "*.{json,md,yaml,yml,css}": "vp fmt --write",
  },
  plugins: lazyPlugins(async () => [
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
  ]),
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
