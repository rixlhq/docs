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

  it("stays minimal for an empty operation", () => {
    expect(details({})).toEqual(["", "- Authorization: not specified", "", "- Servers:", `  - \`${API_BASE_URL}\``]);
  });

  it("prints the operation description", () => {
    expect(details({description: "Creates a video."})).toContain("Creates a video.");
  });

  it("lists parameters with location, requirement, type and description", () => {
    const lines = details({
      parameters: [
        {name: "videoId", in: "path", required: true, schema: {type: "string", format: "uuid"}, description: "The video"},
        {name: "status", in: "query", type: "string", enum: ["ready", "failed"]},
      ],
    });
    expect(lines).toContain("- Parameters:");
    expect(lines).toContain("  - `videoId` (path, required, string (uuid)): The video");
    expect(lines).toContain("  - `status` (query, optional, string enum=`ready`, `failed`)");
  });

  it("labels parameters without a name or location as unknown", () => {
    expect(details({parameters: [{type: "string"}]})).toContain("  - `unknown` (unknown, optional, string)");
  });

  it("omits the type segment when the parameter has no type", () => {
    expect(details({parameters: [{name: "p", in: "query", format: "uuid"}]})).toContain("  - `p` (query, optional)");
  });

  it("omits the enum segment for an empty enum list", () => {
    expect(details({parameters: [{name: "p", in: "query", type: "string", enum: []}]})).toContain("  - `p` (query, optional, string)");
  });

  it("ignores a non-object parameter schema", () => {
    const lines = details({
      parameters: [
        {name: "a", in: "query", schema: 5, type: "string"},
        {name: "b", in: "query", schema: null, type: "number"},
      ],
    });
    expect(lines).toContain("  - `a` (query, optional, string)");
    expect(lines).toContain("  - `b` (query, optional, number)");
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
    expect(details({}, {security: []})).toContain("- Authorization: not specified");
  });

  it("names a scheme the spec doesn't define, with its scopes", () => {
    expect(details({security: [{custom: ["a"]}]})).toContain("  - `custom` scopes=`a`");
  });

  it("describes Swagger 2 securityDefinitions schemes", () => {
    const lines = details({security: [{bearer: []}]}, {securityDefinitions: {bearer: {type: "http", scheme: "bearer"}}});
    expect(lines).toContain("  - `bearer` (http bearer)");
  });

  it("honors the apiKey location and omits empty scope lists", () => {
    const lines = details(
      {security: [{key: []}, {oauth: []}, {oidc: []}]},
      {
        components: {
          securitySchemes: {
            key: {type: "apiKey", in: "query", name: "key"},
            oauth: {type: "oauth2"},
            oidc: {type: "openIdConnect"},
          },
        },
      }
    );
    expect(lines).toContain("  - `key` (apiKey in query `key`)");
    expect(lines).toContain("  - `oauth` (oauth2)");
    expect(lines).toContain("  - `oidc` (openIdConnect)");
  });

  it("falls back to a generic auth label for unknown scheme types", () => {
    expect(details({security: [{x: []}]}, {components: {securitySchemes: {x: {type: "weird"}}}})).toContain("  - `x` (weird)");
    expect(details({security: [{x: []}]}, {components: {securitySchemes: {x: {}}}})).toContain("  - `x` (auth)");
  });

  it("falls back to the production API server", () => {
    expect(details({})).toContain(`  - \`${API_BASE_URL}\``);
  });

  it("lists server variables with defaults and descriptions", () => {
    const lines = details({
      servers: [
        {
          url: "https://{region}.example",
          description: "Edge",
          variables: {region: {default: "eu", description: "Region"}, ghost: undefined},
        },
      ],
    });
    expect(lines).toContain("  - `https://eu.example`: Edge");
    expect(lines).toContain("    - `region` default=`eu`: Region");
    expect(lines).not.toContain("    - `ghost`");
  });

  it("prints the request body description line", () => {
    const lines = details({requestBody: {required: false, description: "The upload", content: {"multipart/form-data": {}}}});
    expect(lines).toEqual(
      expect.arrayContaining(["- Request body:", "  - Content type: `multipart/form-data` (optional)", "    - The upload"])
    );
  });

  it("renders a response content schema structure", () => {
    const lines = details({
      produces: ["application/json"],
      responses: {"200": {description: "ok", schema: {type: "object", properties: {id: {type: "string"}}}}},
    });
    expect(lines).toEqual(
      expect.arrayContaining(["- Responses:", "  - `200`: ok", "    - Content type: `application/json`", "      - Type structure:"])
    );
  });

  it("skips a falsy response entry", () => {
    const lines = details({responses: {"200": undefined, "404": {description: "Missing"}}});
    expect(lines).toContain("  - `404`: Missing");
    expect(lines).not.toContain("  - `200`");
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
