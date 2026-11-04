import "@tanstack/react-start/server-only";
import {loader, multiple} from "fumadocs-core/source";
import * as icons from "lucide-static";
import {docs} from "@/lib/docs";
import {i18n} from "@/lib/i18n";
import {createElement} from "react";
import {openapiPlugin, openapiSource} from "fumadocs-openapi/server";
import {openapi} from "@/lib/openapi.server";
import {openApiPagesOptions} from "@/lib/openapi-pages";

const openApi = await openapiSource(openapi, {
  ...openApiPagesOptions,
  baseDir: "en/api",
});

export const source = loader({
  i18n,
  baseUrl: "/",
  plugins: [openapiPlugin()],
  icon(icon) {
    if (icon && icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
  source: multiple({
    docs: docs.toFumadocsSource(),
    api: openApi,
  }),
});
