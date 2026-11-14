import * as Sentry from "@sentry/react";

export function startSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!import.meta.env.PROD || !dsn) return;

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      // userInfo lets the rollout's Sentry gate count distinct users per new issue.
      dataCollection: {userInfo: true, urlQueryParams: false},
    });
  } catch (error) {
    console.warn("Sentry failed to start; continuing without telemetry:", error);
  }
}
