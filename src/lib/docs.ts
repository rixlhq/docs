import {defineDocs} from "fumadocs-mdx/macro";
import {metaSchema, pageSchema} from "fumadocs-core/source/schema";

// Client-safe: imported by both server loaders and the browser route.
// `async: true` keeps page MDX in per-page chunks instead of one bundle;
// preload entries in route loaders so first render doesn't suspend.
export const docs = defineDocs({
  dir: "content",
  docs: {
    async: true,
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});
