import {defineI18n} from "fumadocs-core/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  // Paraglide reads its own list from project.inlang/settings.json; a test keeps the two equal.
  languages: ["en"],
  fallbackLanguage: "en",
  parser: "dir",
});
