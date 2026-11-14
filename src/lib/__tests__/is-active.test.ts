import fc from "fast-check";
import {describe, expect, it} from "vite-plus/test";
import {isActive} from "@/lib/is-active";

const segment = fc.stringMatching(/^[a-z0-9-]{1,12}$/);
const path = fc.array(segment, {minLength: 1, maxLength: 4}).map((parts) => `/${parts.join("/")}`);

describe("isActive", () => {
  it("is active on the page itself", () => {
    expect(isActive("/en/home", "/en/home")).toBe(true);
  });

  it("ignores a trailing slash on either side", () => {
    expect(isActive("/en/home/", "/en/home")).toBe(true);
    expect(isActive("/en/home", "/en/home/")).toBe(true);
  });

  it("is active on a nested page by default", () => {
    expect(isActive("/en/home", "/en/home/developer")).toBe(true);
  });

  it("is not active on a nested page when nested is false", () => {
    expect(isActive("/en/home", "/en/home/developer", {nested: false})).toBe(false);
  });

  it("is not active on a sibling that shares a prefix", () => {
    expect(isActive("/en/home", "/en/homepage")).toBe(false);
  });

  it("is active inside a listed subfolder, even when the url doesn't match", () => {
    expect(isActive("/en/home", "/en/api/videos", {nested: false, activeSubfolders: ["/en/api/"]})).toBe(true);
    expect(isActive("/en/home", "/en/api", {activeSubfolders: ["/en/api"]})).toBe(true);
  });

  it("is not active in a subfolder that only shares a prefix", () => {
    expect(isActive("/en/home", "/en/apis", {activeSubfolders: ["/en/api"]})).toBe(false);
  });

  it("[property] a page is always active for itself, with or without a trailing slash", () => {
    fc.assert(fc.property(path, fc.boolean(), (url, nested) => isActive(url, `${url}/`, {nested})));
  });

  it("[property] a page is active for its children only when nested", () => {
    fc.assert(
      fc.property(path, segment, fc.boolean(), (url, child, nested) => {
        expect(isActive(url, `${url}/${child}`, {nested})).toBe(nested);
      })
    );
  });
});
