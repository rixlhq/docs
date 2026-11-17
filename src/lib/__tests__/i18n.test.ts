import {readFileSync} from "node:fs";
import path from "node:path";
import {expect, it} from "vite-plus/test";
import {i18n} from "@/lib/i18n";

function projectInlangSettings(): {baseLocale: string; locales: string[]} {
  const settingsPath = path.resolve(import.meta.dirname, "../../../project.inlang/settings.json");
  return JSON.parse(readFileSync(settingsPath, "utf8"));
}

it("serves pages in exactly the locales Paraglide translates the UI into", () => {
  const {baseLocale, locales} = projectInlangSettings();

  expect({defaultLanguage: i18n.defaultLanguage, languages: [...i18n.languages].sort()}).toEqual({
    defaultLanguage: baseLocale,
    languages: [...locales].sort(),
  });
});

it("pins the fallback language and directory parser the loaders rely on", () => {
  expect(i18n.fallbackLanguage).toBe(projectInlangSettings().baseLocale);
  expect(i18n.parser).toBe("dir");
});
