import {createRootRoute, HeadContent, Scripts, useParams} from "@tanstack/react-router";
import {TanstackProvider} from "fumadocs-core/framework/tanstack";
import * as React from "react";
import appCss from "@/styles/app.css?url";
import {i18n} from "@/lib/i18n";
import {earlyNavigationScript, useReplayEarlyNavigation} from "@/lib/early-navigation";
import {Provider} from "@/components/layout/shared/provider.tsx";
import {Body} from "@/components/layout/shared/layout-client.tsx";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {charSet: "utf-8"},
      {name: "viewport", content: "width=device-width, initial-scale=1"},
      {name: "theme-color", content: "#000000"},
    ],
    links: [
      {rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "any"},
      {rel: "icon", type: "image/svg+xml", href: "/favicon.svg"},
      {rel: "icon", type: "image/png", href: "/icon.png", sizes: "512x512"},
      {rel: "apple-touch-icon", href: "/apple-icon.png", sizes: "180x180"},
      {rel: "mask-icon", href: "/mask-icon.svg", color: "#000000"},
      {rel: "manifest", href: "/manifest.json"},
      {rel: "stylesheet", href: appCss},
    ],
    // Routes internal link clicks through the router even before hydration,
    // so they never fall through to full page loads (see early-navigation.ts).
    scripts: [{children: earlyNavigationScript}],
  }),
  // The document is the shell, not the root component: TanStack then still
  // renders it around error and not-found screens, so <html lang>, <head> and
  // the Provider stay in place instead of the page dropping to a bare error.
  shellComponent: RootDocument,
});

function RootDocument({children}: {children: React.ReactNode}) {
  const {lang} = useParams({strict: false});
  // Only supported languages are valid (e.g. not the "/_shell" mask path or
  // an unknown "/xx/" prefix); everything else falls back to the default.
  const supported = i18n.languages as readonly string[];
  const validLang = lang && supported.includes(lang) ? lang : i18n.defaultLanguage;
  // Pages served the 404.html shell (prerendered as English) keep its lang
  // after hydration, since React does not patch <html> attributes; a missing
  // /de/ page would stay announced as English.
  React.useEffect(() => {
    document.documentElement.lang = validLang;
  }, [validLang]);
  useReplayEarlyNavigation();

  return (
    <html
      lang={validLang}
      suppressHydrationWarning
      className="scroll-smooth overscroll-y-none"
      style={{fontFamily: "Inter, system-ui, sans-serif"}}
    >
      <head>
        <HeadContent />
      </head>
      <Body>
        <TanstackProvider>
          <Provider lang={validLang}>{children}</Provider>
        </TanstackProvider>
        <Scripts />
      </Body>
    </html>
  );
}
