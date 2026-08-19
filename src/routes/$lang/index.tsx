import {createFileRoute, redirect} from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/$lang/$",
      params: {
        lang: params.lang,
        _splat: "home",
      },
    });
  },
});
