import {useRouter} from "@tanstack/react-router";
import {useEffect} from "react";

interface EarlyNavigationState {
  pendingHref?: string;
  navigate?: (href: string) => void;
}

declare global {
  interface Window {
    __earlyNav?: EarlyNavigationState;
  }
}

/**
 * Until React has hydrated a link, clicking it is a native document
 * navigation: on a node it is still hydrating, React stops the click's
 * propagation but does not prevent its default. On a slow connection the page
 * is visible but not fully hydrated for a second or more, so quick clicks
 * reload the whole page (the flash). Whether React will handle a given click
 * cannot be known up front, so this inline script owns plain clicks on
 * internal page links: it always routes them through router.navigate(),
 * queueing the last one until useReplayEarlyNavigation() provides the router.
 * The router's <Link> skips clicks that are already defaultPrevented, so there
 * is no double navigation; its other handlers (preload on hover) still run. If
 * the app never hydrates (JS failed to load), it falls back to native
 * navigation.
 *
 * Serialized into an inline <script>: it must stay self-contained.
 */
function captureEarlyNavigation() {
  // TanStack re-injects head scripts whose text differs from the SSR copy, and
  // toString() differs between the server and client bundles: run once only.
  if (window.__earlyNav) return;
  const FALLBACK_MS = 4000;
  const state: EarlyNavigationState = {};
  window.__earlyNav = state;

  function isPlainClick(event: MouseEvent) {
    return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  // Same-origin page URLs only: not new tabs, downloads, files (.md, .txt,
  // images) or in-page hash jumps.
  function internalHref(anchor: HTMLAnchorElement) {
    if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || /\.[a-z0-9]+$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    return url.pathname + url.search + url.hash;
  }

  // Capture phase on window: runs before React's listeners on the document.
  window.addEventListener(
    "click",
    (event) => {
      if (!isPlainClick(event) || !(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      const href = anchor instanceof HTMLAnchorElement ? internalHref(anchor) : undefined;
      if (!href) return;
      event.preventDefault();
      if (state.navigate) return state.navigate(href);
      state.pendingHref = href;
      setTimeout(() => {
        if (!state.navigate) location.assign(href);
      }, FALLBACK_MS);
    },
    true
  );
}

export const earlyNavigationScript = `(${captureEarlyNavigation.toString()})()`;

export function useReplayEarlyNavigation() {
  const router = useRouter();

  useEffect(() => {
    const state = window.__earlyNav;
    if (!state) return;
    state.navigate = (href) => void router.navigate({href});
    if (state.pendingHref) state.navigate(state.pendingHref);
    state.pendingHref = undefined;
  }, [router]);
}
