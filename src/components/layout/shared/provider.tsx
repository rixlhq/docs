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
  de: {
    displayName: "Deutsch",
    "Search(search dialog)": "Suche",
    "Search(search trigger)": "Suche",
    "Open Search(search trigger)(aria-label)": "Suche öffnen",
    "Close Search(search dialog)(aria-label)": "Suche schließen",
    "No results found(search dialog)": "Keine Ergebnisse gefunden",
    "On this page(table of contents)": "Auf dieser Seite",
    "No Headings(table of contents)": "Keine Überschriften",
    "Table of Contents(inline table of contents)": "Inhaltsverzeichnis",
    "Last updated on(page footer)": "Zuletzt aktualisiert am",
    "Choose a language(language switcher)": "Sprache wählen",
    "Choose a language(language switcher)(aria-label)": "Sprache wählen",
    "Edit on GitHub(edit page)": "Auf GitHub bearbeiten",
    "Previous Page(pagination)": "Vorherige Seite",
    "Next Page(pagination)": "Nächste Seite",
    "Toggle Theme(theme switcher)(aria-label)": "Thema umschalten",
    "Light(theme switcher)(aria-label)": "Hell",
    "Dark(theme switcher)(aria-label)": "Dunkel",
    "System(theme switcher)(aria-label)": "System",
    "Toggle Menu(mobile menu)(aria-label)": "Menü umschalten",
    "Open Sidebar(sidebar)(aria-label)": "Seitenleiste öffnen",
    "Close Sidebar(sidebar)(aria-label)": "Seitenleiste schließen",
    "Collapse Sidebar(sidebar)(aria-label)": "Seitenleiste einklappen",
    "Close Banner(banner)(aria-label)": "Banner schließen",
    "Copy Text(code block)(aria-label)": "Text kopieren",
    "Copied Text(code block)(aria-label)": "Text kopiert",
    "Copy Anchor Link(heading anchor)(aria-label)": "Ankerlink kopieren",
    "Copy Link(accordion)(aria-label)": "Link kopieren",
    "Copy Markdown(page actions)": "Markdown kopieren",
    "View as Markdown(page actions)": "Als Markdown anzeigen",
    "Open(page actions)": "Öffnen",
    "Open in GitHub(page actions)": "In GitHub öffnen",
    "Open in ChatGPT(page actions)": "In ChatGPT öffnen",
    "Open in Claude(page actions)": "In Claude öffnen",
    "Open in Cursor(page actions)": "In Cursor öffnen",
    "Open in Scira AI(page actions)": "In Scira AI öffnen",
    "Read {url}, I want to ask questions about it.(page actions)": "Lies {url}, ich möchte Fragen dazu stellen.",
    "Type(type table)": "Typ",
    "Prop(type table)": "Eigenschaft",
    "Parameters(type table)": "Parameter",
    "Returns(type table)": "Rückgabewerte",
    "Default(type table)": "Standard",
    "Back to Home(404 page)": "Zurück zur Startseite",
    "Page Not Found(404 page)": "Seite nicht gefunden",
    "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 page)":
      "Die gesuchte Seite wurde möglicherweise entfernt, umbenannt oder ist vorübergehend nicht verfügbar.",
  },
  // TODO: add `ru` using the same source-text key format to enable Russian.
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
