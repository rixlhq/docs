/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sentry client key; CI sets it from the repo's SENTRY_DSN variable. Unset: no Sentry. */
  readonly VITE_SENTRY_DSN?: string;
}
