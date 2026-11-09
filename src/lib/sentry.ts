import * as Sentry from "@sentry/react";

/**
 * Starts Sentry in the browser, for the rollout's gate (.github/workflows/rollout.yml)
 * as much as for debugging: it rolls a release back when errors first seen in it
 * reach enough users, or when its share of errored sessions climbs above the old
 * release's.
 *
 * Both need only what the SDK sends by default: errors, and one session per page
 * load. The release (the commit) is stamped in by @sentry/vite-plugin at build
 * time, so each event names the version that threw it. `userInfo` lets Sentry
 * count distinct users (by IP) for the "new issue hit N users" rule; query
 * strings stay out, as on the dashboard.
 *
 * Only production builds with a DSN report (CI passes VITE_SENTRY_DSN from the
 * repo's SENTRY_DSN variable), so local builds and dev servers stay silent.
 * Telemetry must never take the page down, so a failure to start is logged and
 * the page carries on.
 */
export function startSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!import.meta.env.PROD || !dsn) return;

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      dataCollection: {userInfo: true, urlQueryParams: false},
    });
  } catch (error) {
    console.warn("Sentry failed to start; continuing without telemetry:", error);
  }
}
