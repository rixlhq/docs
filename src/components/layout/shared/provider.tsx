import {useRouter} from "@tanstack/react-router";
import {defineI18nUI} from "fumadocs-ui/i18n";
import {RootProvider} from "fumadocs-ui/provider/base";
import type {ReactNode} from "react";
import {lazy} from "react";
import {i18n} from "@/lib/i18n.ts";
import {baseLocale, locales, overwriteGetLocale} from "@/paraglide/runtime";

const SearchDialog = lazy(() => import("@/components/search"));

const {provider} = defineI18nUI(i18n, {
  // English is the base locale: fumadocs falls back to the source text,
  // so only the switcher display name is needed here.
  en: {
    displayName: "English",
  },
  de: {
    displayName: "Deutsch",
    "Toggle Menu(mobile menu)(aria-label)": "Menü umschalten",
    "Open Sidebar(sidebar)(aria-label)": "Seitenleiste öffnen",
    "Close Sidebar(sidebar)(aria-label)": "Seitenleiste schließen",
  },
});

type Locale = (typeof locales)[number];

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function Provider({children, lang}: {children: ReactNode; lang?: string}) {
  const router = useRouter();

  // Route paraglide's getLocale() through the URL segment. The default
  // strategy chain reads `window.location` on the client, but on the
  // server (and during the very first client render before hydration)
  // paraglide can't see the URL — so we pin it to the current lang param
  // in both places. This keeps `m.xxx()` in sync with the route.
  const resolved: Locale = isLocale(lang) ? lang : baseLocale;
  overwriteGetLocale(() => resolved);

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
