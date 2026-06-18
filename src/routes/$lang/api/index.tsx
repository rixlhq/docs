import {createFileRoute, redirect} from "@tanstack/react-router";
import {getApiEntrySlug} from "@/lib/server/docs-loader";

export const Route = createFileRoute("/$lang/api/")({
  beforeLoad: async ({params}) => {
    const splat = await getApiEntrySlug({data: {lang: params.lang}});
    throw redirect({
      to: "/$lang/$",
      params: {
        lang: params.lang,
        _splat: splat,
      },
    });
  },
});
