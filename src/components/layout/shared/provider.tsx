import {defineI18nUI} from "fumadocs-ui/i18n";
import {RootProvider} from "fumadocs-ui/provider/base";
import type {ReactNode} from "react";
import {lazy} from "react";
import {CustomTranslationProvider} from "@/components/custom-translation-provider";
import {i18n} from "@/lib/i18n.ts";

const SearchDialog = lazy(() => import("@/components/search"));

const {provider} = defineI18nUI(i18n, {
  en: {
    displayName: "English",
    "Search(search dialog)": "Search",
    "No results found(search dialog)": "No results found",
    "On this page(table of contents)": "On This Page",
    "No Headings(table of contents)": "No headings found",
    "Last updated on(page footer)": "Last updated on",
    "Choose a language(language switcher)": "Choose Language",
    "Choose a language(language switcher)(aria-label)": "Choose Language",
  },
});

export function Provider({children, lang}: {children: ReactNode; lang?: string}) {
  return (
    <RootProvider i18n={provider(lang)} search={{SearchDialog}}>
      <CustomTranslationProvider locale={lang}>{children}</CustomTranslationProvider>
    </RootProvider>
  );
}
