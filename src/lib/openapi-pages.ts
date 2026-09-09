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

/**
 * Turns a tag into a path, treating `/` as a folder separator.
 *
 * Tags are two-level and spaced, e.g. `Auth / Authentication`. The default
 * slugify only lowercases and replaces whitespace, so the spaces around the
 * slash became hyphens of their own — `auth-/-authentication` — and the leading
 * hyphen also stopped the sidebar from title-casing the folder.
 */
function toSlug(name: string) {
  return name
    .split("/")
    .map((segment) =>
      segment
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .filter(Boolean)
    .join("/");
}

export const openApiPagesOptions: OpenAPISourceOptions = {
  per: "operation",
  groupBy: "tag",
  slugify: toSlug,
  // Titles the sidebar from each tag's x-displayName rather than from the slug.
  // Auto-titling a folder name would also mangle initialisms — `totp` reads as
  // "Totp", where the spec says "TOTP".
  meta: true,
  name(entry) {
    if (entry.type === "operation") {
      return `${entry.item.method.toLowerCase()}-${toFlatFileName(entry.item.path)}`;
    }

    return `webhook-${entry.item.method.toLowerCase()}-${toFlatFileName(entry.item.name)}`;
  },
};
