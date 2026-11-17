import fc from "fast-check";
import {describe, expect, it} from "vite-plus/test";
import {openApiPagesOptions} from "@/lib/openapi-pages";

type NameFn = (entry: {type: string; item: {method: string; path?: string; name?: string}}) => string;
// `name` is a callback here; the source option type also allows a string, which this config doesn't use.
const pageName = openApiPagesOptions.name as unknown as NameFn;

describe("openApiPagesOptions.name", () => {
  it("names an operation page method-path, without braces or slashes", () => {
    expect(pageName({type: "operation", item: {method: "GET", path: "/videos/{videoId}/captions"}})).toBe("get-videos-videoid-captions");
  });

  it("names the root path root", () => {
    expect(pageName({type: "operation", item: {method: "GET", path: "/"}})).toBe("get-root");
  });

  it("prefixes webhook pages", () => {
    expect(pageName({type: "webhook", item: {method: "POST", name: "video.ready"}})).toBe("webhook-post-video-ready");
  });

  it("keeps inner slashes as separators even without a leading slash", () => {
    expect(pageName({type: "operation", item: {method: "GET", path: "videos/{videoId}/captions"}})).toBe("get-videos-videoid-captions");
  });

  it("[property] always gives a lowercase slug without doubled or outer dashes", () => {
    fc.assert(
      fc.property(fc.string(), (path) => {
        const name = pageName({type: "operation", item: {method: "GET", path}});
        expect(name).toMatch(/^get-[a-z0-9_]+(-[a-z0-9_]+)*$/);
      })
    );
  });
});

describe("openApiPagesOptions", () => {
  it("groups one page per operation by tag, emitting meta files", () => {
    expect(openApiPagesOptions).toMatchObject({per: "operation", groupBy: "tag", meta: true});
  });
});
