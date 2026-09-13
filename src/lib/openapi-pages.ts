import type {OpenAPISourceOptions} from "fumadocs-openapi/server";

function toFlatFileName(value: string) {
  const flattened = value
    .replace(/^\//, "")
    .replace(/[{}]/g, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return flattened.length > 0 ? flattened : "root";
}

export const openApiPagesOptions: OpenAPISourceOptions = {
  per: "operation",
  groupBy: "tag",
  // Titles groups from each tag's x-displayName, keeping the spec the source of
  // truth for naming. Auto-titling the folder would mangle initialisms — `totp`
  // reads as "Totp", where the spec says "TOTP".
  meta: true,
  name(entry) {
    if (entry.type === "operation") {
      return `${entry.item.method.toLowerCase()}-${toFlatFileName(entry.item.path)}`;
    }

    return `webhook-${entry.item.method.toLowerCase()}-${toFlatFileName(entry.item.name)}`;
  },
};
