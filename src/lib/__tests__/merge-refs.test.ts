import {describe, expect, it, vi} from "vite-plus/test";
import {mergeRefs} from "@/lib/merge-refs";

describe("mergeRefs", () => {
  it("passes the value to callback refs and sets object refs", () => {
    const callback = vi.fn();
    const object: {current: string | null} = {current: null};

    mergeRefs<string>(callback, object, undefined)("node");

    expect(callback).toHaveBeenCalledWith("node");
    expect(object.current).toBe("node");
  });

  it("clears object refs on unmount", () => {
    const object: {current: string | null} = {current: "node"};

    mergeRefs<string>(object)(null);

    expect(object.current).toBeNull();
  });
});
