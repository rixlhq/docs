import {useRouter} from "@tanstack/react-router";
import {defineI18nUI} from "fumadocs-ui/i18n";
import {RootProvider} from "fumadocs-ui/provider/base";
import type {ReactNode} from "react";
import {lazy} from "react";
import {i18n} from "@/lib/i18n.ts";

const SearchDialog = lazy(() => import("@/components/search"));

const {provider} = defineI18nUI(i18n, {
  // English is the base locale: fumadocs falls back to the source text,
  // so only the switcher display name is needed here.
  en: {
    displayName: "English",
  },
  // Keys are fumadocs' source-text keys ("<English text>(<context note>)"),
  // as listed in fumadocs-ui/dist/.translations/keys.js.
  // Only keys for fumadocs-owned components we haven't ejected yet.
  // App-owned strings live in `messages/*.json` and are read via `@/paraglide/messages`.
  // TODO: eject the remaining surfaces (search dialog, docs footer/pagination,
  // sidebar/mobile menu aria labels, type table) and move each key to paraglide,
  // then delete it from here.
  de: {
    displayName: "Deutsch",
    "Search(search dialog)": "Suche",
    "Search(search trigger)": "Suche",
    "Open Search(search trigger)(aria-label)": "Suche öffnen",
    "Close Search(search dialog)(aria-label)": "Suche schließen",
    "No results found(search dialog)": "Keine Ergebnisse gefunden",
    "Last updated on(page footer)": "Zuletzt aktualisiert am",
    "Edit on GitHub(edit page)": "Auf GitHub bearbeiten",
    "Previous Page(pagination)": "Vorherige Seite",
    "Next Page(pagination)": "Nächste Seite",
    "Toggle Menu(mobile menu)(aria-label)": "Menü umschalten",
    "Open Sidebar(sidebar)(aria-label)": "Seitenleiste öffnen",
    "Close Sidebar(sidebar)(aria-label)": "Seitenleiste schließen",
    "Collapse Sidebar(sidebar)(aria-label)": "Seitenleiste einklappen",
    "Type(type table)": "Typ",
    "Prop(type table)": "Eigenschaft",
    "Parameters(type table)": "Parameter",
    "Returns(type table)": "Rückgabewerte",
    "Default(type table)": "Standard",
  },
});

export function Provider({children, lang}: {children: ReactNode; lang?: string}) {
  const router = useRouter();

  return (
    <RootProvider
      i18n={{
        ...provider(lang),
        // Swap the leading locale segment via client-side history push so
        // switching languages re-renders without a full page reload.
        onLocaleChange: (locale) => {
          const {href} = router.state.location;
          router.history.push(href.replace(/^\/[^/?#]+/, `/${locale}`));
        },
      }}
      search={{SearchDialog}}
    >
      {children}
    </RootProvider>
  );
}
