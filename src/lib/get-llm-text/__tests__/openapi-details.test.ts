import {describe, expect, it} from "vite-plus/test";
import {API_BASE_URL} from "@/lib/api-base-url";
import {appendOperationDetails} from "../openapi-details";
import type {OpenApiDereferencedSchema, OpenApiOperation} from "../types";

function details(operation: OpenApiOperation | undefined, schema?: OpenApiDereferencedSchema): string[] {
  const lines: string[] = [];
  appendOperationDetails(lines, operation, schema);
  return lines;
}

describe("appendOperationDetails", () => {
  it("says the details are unavailable when the operation isn't in the spec", () => {
    expect(details(undefined)).toEqual(["- Details: unavailable in schema snapshot."]);
  });

  it("lists parameters with location, requirement, type and description", () => {
    const lines = details({
      parameters: [
        {name: "videoId", in: "path", required: true, schema: {type: "string", format: "uuid"}, description: "The video"},
        {name: "status", in: "query", type: "string", enum: ["ready", "failed"]},
      ],
    });
    expect(lines).toContain("  - `videoId` (path, required, string (uuid)): The video");
    expect(lines).toContain("  - `status` (query, optional, string enum=`ready`, `failed`)");
  });

  it("describes inherited auth schemes by type", () => {
    const lines = details(
      {},
      {
        security: [{apiKey: []}, {bearer: []}, {oauth: ["videos:read"]}],
        components: {
          securitySchemes: {
            apiKey: {type: "apiKey", in: "header", name: "X-API-Key"},
            bearer: {type: "http", scheme: "bearer", bearerFormat: "JWT"},
            oauth: {type: "oauth2"},
          },
        },
      }
    );
    expect(lines).toContain("  - `apiKey` (apiKey in header `X-API-Key`)");
    expect(lines).toContain("  - `bearer` (http bearer JWT)");
    expect(lines).toContain("  - `oauth` (oauth2 scopes=`videos:read`)");
  });

  it("says no auth when the operation clears it, and not specified when nothing sets it", () => {
    expect(details({security: []})).toContain("- Authorization: none");
    expect(details({})).toContain("- Authorization: not specified");
  });

  it("names a scheme the spec doesn't define, with its scopes", () => {
    expect(details({security: [{custom: ["a"]}]})).toContain("  - `custom` scopes=`a`");
  });

  it("falls back to the production API server", () => {
    expect(details({})).toContain(`  - \`${API_BASE_URL}\``);
  });

  it("renders the request body and each response with its structure", () => {
    const lines = details({
      requestBody: {required: true, content: {"application/json": {schema: {type: "object", properties: {title: {type: "string"}}}}}},
      responses: {"204": {description: "Deleted"}},
    });
    expect(lines).toEqual(
      expect.arrayContaining([
        "- Request body:",
        "  - Content type: `application/json` (required)",
        "    - Type structure:",
        "      - `body*`: object",
        "        - Fields:",
        "          - `title`: string",
        "- Responses:",
        "  - `204`: Deleted",
        "    - Content type: `n/a`",
      ])
    );
  });
});
