/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],
  vitest: {configFile: "test/stryker.vitest.config.ts"},
  coverageAnalysis: "perTest",
  incremental: true,
  incrementalFile: ".stryker-cache/incremental.json",
  // The code the unit project tests. Components are checked by axe in the browser project, which is too slow to rerun per mutant.
  mutate: ["src/lib/**/*.{ts,tsx}", "src/components/mdx/api-page/**/*.{ts,tsx}", "plugins/*.ts", "scripts/lib/*.ts", "!**/__tests__/**"],
  // .claude is a symlink to .agents, which Stryker can't copy into its sandbox; tests need neither.
  ignorePatterns: [
    ".claude",
    ".agents",
    "coverage",
    "reports",
    "openspec",
    "dist",
    ".output",
    ".vitest",
    ".stryker-cache",
    "content/**/*.png",
  ],
  // Stryker rewrites tsconfig files through the TypeScript JS API, which TypeScript 7 no longer ships.
  // Our tsconfig only references files inside the sandbox, so the rewrite is skipped by pointing at no file.
  tsconfigFile: "",
  reporters: ["html", "json", "clear-text", "progress"],
  htmlReporter: {fileName: "reports/mutation/index.html"},
  jsonReporter: {fileName: "reports/mutation/mutation.json"},
  thresholds: {high: 90, low: 80, break: null},
  tempDirName: ".stryker-tmp",
  concurrency: 4,
};
