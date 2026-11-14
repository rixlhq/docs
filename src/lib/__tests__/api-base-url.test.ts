import fc from "fast-check";
import {describe, expect, it} from "vite-plus/test";
import {API_BASE_URL, joinApiUrl, resolveOpenApiBaseUrl, resolveOpenApiServers} from "@/lib/api-base-url";

describe("resolveOpenApiServers", () => {
  it("falls back to the production API with no spec or servers", () => {
    expect(resolveOpenApiServers(undefined)).toEqual([{url: API_BASE_URL}]);
    expect(resolveOpenApiServers({servers: []})).toEqual([{url: API_BASE_URL}]);
  });

  it("prefers operation servers over root servers", () => {
    const servers = resolveOpenApiServers({servers: [{url: "https://root.example"}]}, [{url: "https://op.example"}]);
    expect(servers.map((server) => server.url)).toEqual(["https://op.example"]);
  });

  it("fills template variables from their defaults and drops the trailing slash", () => {
    const servers = resolveOpenApiServers({
      servers: [{url: "https://{region}.example/{version}/", variables: {region: {default: "eu"}, version: {default: "v1"}}}],
    });
    expect(servers[0]?.url).toBe("https://eu.example/v1");
  });

  it("upgrades http to https", () => {
    expect(resolveOpenApiBaseUrl({servers: [{url: "http://api.example/"}]})).toBe("https://api.example");
  });

  it("puts a relative server under the production API", () => {
    expect(resolveOpenApiBaseUrl({servers: [{url: "v2"}]})).toBe(`${API_BASE_URL}/v2`);
    expect(resolveOpenApiBaseUrl({servers: [{url: "/"}]})).toBe(API_BASE_URL);
  });

  it("skips servers without a url and removes duplicates", () => {
    const servers = resolveOpenApiServers({
      servers: [{description: "no url"}, {url: "https://a.example"}, {url: "https://a.example/"}],
    });
    expect(servers.map((server) => server.url)).toEqual(["https://a.example"]);
  });

  it("builds the url from a Swagger 2 host, preferring https", () => {
    expect(resolveOpenApiBaseUrl({host: "api.example", schemes: ["HTTP", "HTTPS"], basePath: "v1"})).toBe("https://api.example/v1");
    expect(resolveOpenApiBaseUrl({host: "api.example", basePath: "/"})).toBe("https://api.example");
  });
});

describe("joinApiUrl", () => {
  it("joins with exactly one slash", () => {
    expect(joinApiUrl("https://api.example/", "/videos")).toBe("https://api.example/videos");
    expect(joinApiUrl("https://api.example", "videos")).toBe("https://api.example/videos");
  });

  it("returns the base without its trailing slash for an empty path", () => {
    expect(joinApiUrl("https://api.example/", "")).toBe("https://api.example");
  });

  it("[property] never puts two slashes between base and path", () => {
    const part = fc.stringMatching(/^[a-z0-9-]{1,10}$/);
    fc.assert(
      fc.property(part, part, fc.boolean(), fc.boolean(), (host, pathname, baseSlash, pathSlash) => {
        const joined = joinApiUrl(`https://${host}.example${baseSlash ? "/" : ""}`, `${pathSlash ? "/" : ""}${pathname}`);
        expect(joined).toBe(`https://${host}.example/${pathname}`);
      })
    );
  });
});
