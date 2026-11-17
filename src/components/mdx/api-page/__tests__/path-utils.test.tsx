import {describe, expect, it} from "vite-plus/test";
import {findOperationPath, resolveRequestPath} from "../path-utils";
import type {EncodedRequestData, OpenApiRenderContext} from "../types";

function request(data: Partial<EncodedRequestData>): EncodedRequestData {
  return {method: "GET", path: {}, query: {}, header: {}, cookie: {}, ...data};
}

describe("resolveRequestPath", () => {
  it("fills path parameters and appends the query", () => {
    const resolved = resolveRequestPath(
      "/videos/{videoId}",
      request({path: {videoId: {value: "abc"}}, query: {status: {values: ["ready", "failed"]}, empty: {values: []}}})
    );
    expect(resolved).toBe("/videos/abc?status=ready&status=failed");
  });

  it("replaces a query value already in the path instead of repeating it", () => {
    expect(resolveRequestPath("/videos?limit=10&page=2", request({query: {limit: {values: ["5"]}}}))).toBe("/videos?page=2&limit=5");
  });

  it("returns the path alone when there is no query", () => {
    expect(resolveRequestPath("/videos", request({}))).toBe("/videos");
  });
});

describe("findOperationPath", () => {
  // The render context only needs the spec here; the rest of it is for rendering.
  const ctx = {
    schema: {paths: {"/videos/{videoId}": {get: {operationId: "getVideo", summary: "Get a video"}}}},
  } as unknown as OpenApiRenderContext;

  it("reads the path from the header when the title is the path", () => {
    // Fumadocs renders the operation title as the header's only text.
    const header = (
      <div>
        <h2>{"/videos/{videoId}"}</h2>
      </div>
    );
    expect(findOperationPath({ctx, operation: {}, method: "GET", headerNode: header})).toBe("/videos/{videoId}");
  });

  it("falls back to the spec, by operationId and then by summary", () => {
    expect(findOperationPath({ctx, operation: {operationId: "getVideo"}, method: "GET", headerNode: null})).toBe("/videos/{videoId}");
    expect(findOperationPath({ctx, operation: {summary: "Get a video"}, method: "get", headerNode: "GET"})).toBe("/videos/{videoId}");
  });

  it("finds nothing for another method or an unknown operation", () => {
    expect(findOperationPath({ctx, operation: {operationId: "getVideo"}, method: "POST", headerNode: null})).toBeUndefined();
    expect(findOperationPath({ctx, operation: {operationId: "nope"}, method: "GET", headerNode: null})).toBeUndefined();
  });

  it("finds nothing without a spec", () => {
    const noSpec = {schema: undefined} as unknown as OpenApiRenderContext;
    expect(findOperationPath({ctx: noSpec, operation: {operationId: "getVideo"}, method: "GET", headerNode: null})).toBeUndefined();
  });

  it("skips path entries and operations that are not objects", () => {
    const sparse = {schema: {paths: {"/a": undefined, "/b": {get: undefined}}}} as unknown as OpenApiRenderContext;
    expect(findOperationPath({ctx: sparse, operation: {operationId: "x", summary: "y"}, method: "GET", headerNode: null})).toBeUndefined();
  });

  it("ignores an operation without an operationId when matching by operationId", () => {
    const anonymous = {schema: {paths: {"/anon": {get: {summary: "S"}}}}} as unknown as OpenApiRenderContext;
    expect(findOperationPath({ctx: anonymous, operation: {}, method: "GET", headerNode: null})).toBeUndefined();
  });

  it("finds the path by summary even when it is not the first entry", () => {
    const two = {
      schema: {paths: {"/first": {get: {operationId: "other"}}, "/second": {get: {summary: "Target"}}}},
    } as unknown as OpenApiRenderContext;
    expect(findOperationPath({ctx: two, operation: {summary: "Target"}, method: "GET", headerNode: null})).toBe("/second");
  });

  it("skips a bare slash and reads the first real path", () => {
    expect(findOperationPath({ctx, operation: {}, method: "GET", headerNode: "GET / /videos"})).toBe("/videos");
  });

  it("collects text from an array of nodes without merging tokens", () => {
    const header = [<span key="1">{"GET"}</span>, <span key="2">{"/videos"}</span>];
    expect(findOperationPath({ctx, operation: {}, method: "GET", headerNode: header})).toBe("/videos");
    expect(findOperationPath({ctx, operation: {}, method: "GET", headerNode: ["/v", "1"]})).toBe("/v");
  });

  it("ignores non-element objects when collecting header text", () => {
    expect(findOperationPath({ctx, operation: {}, method: "GET", headerNode: {children: "/videos"}})).toBeUndefined();
  });
});
