import {createMiddleware, createStart} from "@tanstack/react-start";
import {paraglideMiddleware} from "@/paraglide/server";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [
      createMiddleware({type: "request"}).server(async ({request, next}) => {
        // TanStack Router handles URL localization itself via the `$lang`
        // route, so keep the original request and only use paraglide's
        // AsyncLocalStorage to scope getLocale() to this request.
        return paraglideMiddleware(request, () => next());
      }),
    ],
  };
});
