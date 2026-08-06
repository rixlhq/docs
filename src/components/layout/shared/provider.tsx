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
  de: {
    displayName: "Deutsch",
    "Toggle Menu(mobile menu)(aria-label)": "Menü umschalten",
    "Open Sidebar(sidebar)(aria-label)": "Seitenleiste öffnen",
    "Close Sidebar(sidebar)(aria-label)": "Seitenleiste schließen",
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
