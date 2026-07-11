import path from "node:path";
import {defineConfig, lazyPlugins} from "vite-plus";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import {extractIconsPlugin} from "./plugins/vite-plugin-extract-icons";
import {i18n} from "./src/lib/i18n";
import {collectDocsPrerenderPages, createOgPrerenderPages, toStaticPages} from "./scripts/lib/prerender-pages";

// import { nitro } from 'nitro/vite'

const docsPrerenderPages = await collectDocsPrerenderPages({
  contentDir: path.resolve(__dirname, "content"),
  supportedLanguages: i18n.languages,
});
const ogOutputDir = path.resolve(__dirname, "dist/client");
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
      "eslint/complexity": ["error", {max: 10}],
      "eslint/max-lines-per-function": ["error", {max: 50, skipComments: true}],
      "eslint/max-lines": ["error", {max: 250, skipBlankLines: true, skipComments: true}],
      "eslint/max-params": ["error", 3],
      "eslint/max-depth": ["error", 3],
      "eslint/max-statements": ["error", 25],
      "eslint/max-classes-per-file": ["error", 1],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    plugins: ["react", "react-perf", "typescript", "jsx-a11y"],
    ignorePatterns: ["*.html", "docker", "public", "__tests__", "*.test.ts", "routeTree.gen.ts"],
    options: {typeAware: true, typeCheck: true},
    jsPlugins: [{name: "vite-plus", specifier: "vite-plus/oxlint-plugin"}],
  },
  plugins: lazyPlugins(async () => [
    extractIconsPlugin(),
    mdx(await import("./source.config")),
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
    react(),
  ]),
  resolve: {
    alias: {
      "@/snippets": `${__dirname}/src/components/mdx`,
    },
    tsconfigPaths: true,
  },
  optimizeDeps: {
    include: ["xml-js/lib/js2xml"],
  },
  ssr: {
    noExternal: ["@rixl/videosdk-react"],
  },
});
