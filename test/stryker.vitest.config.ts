import baseConfig from "../vite.config.ts";

const [unitProject] = baseConfig.test?.projects ?? [];

// Stryker reruns the tests once per mutant, so it uses only the fast unit project.
export default {
  ...baseConfig,
  test: {...baseConfig.test, coverage: {enabled: false}, projects: [unitProject]},
};
