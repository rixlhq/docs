import {StrictMode, startTransition} from "react";
import {hydrateRoot} from "react-dom/client";
import {StartClient} from "@tanstack/react-start/client";
import {startSentry} from "@/lib/sentry";

// Before hydration, so an error while hydrating is reported too.
startSentry();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>
  );
});
