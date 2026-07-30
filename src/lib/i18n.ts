import {defineI18n} from "fumadocs-core/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  // TODO: Add more languages
  languages: ["en", "de"],
  fallbackLanguage: "en",
  parser: "dir",
});
