import {readFileSync} from "node:fs";
import path from "node:path";
import {expect, it} from "vite-plus/test";
import {i18n} from "@/lib/i18n";

it("serves pages in exactly the locales Paraglide translates the UI into", () => {
  const settingsPath = path.resolve(import.meta.dirname, "../../../project.inlang/settings.json");
  const {baseLocale, locales}: {baseLocale: string; locales: string[]} = JSON.parse(readFileSync(settingsPath, "utf8"));

  expect({defaultLanguage: i18n.defaultLanguage, languages: [...i18n.languages].sort()}).toEqual({
    defaultLanguage: baseLocale,
    languages: [...locales].sort(),
  });
});
