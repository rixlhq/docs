import {afterEach, describe, expect, it, vi} from "vite-plus/test";
import {getBaseUrl} from "@/lib/base-url";

describe("getBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is the local dev server in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getBaseUrl().href).toBe("http://localhost:3000/");
  });

  it("is the production site otherwise", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getBaseUrl().href).toBe("https://developers.rixl.com/");
  });
});
