import fc from "fast-check";
import {describe, expect, it} from "vite-plus/test";
import {appendSchemaNode, createSchemaContext, formatLiteral, getSchemaTypeLabel, inferSchemaType} from "../openapi-schema";
import type {OpenApiSchema} from "../types";

function render(schema: OpenApiSchema): string[] {
  const lines: string[] = [];
  appendSchemaNode(schema, createSchemaContext(lines), {depth: 0, name: "body", required: true});
  return lines;
}

describe("getSchemaTypeLabel", () => {
  it("names a $ref by its last segment", () => {
    expect(getSchemaTypeLabel({$ref: "#/components/schemas/Video"})).toBe("ref<Video>");
  });

  it("joins type unions and adds format and nullable", () => {
    expect(getSchemaTypeLabel({type: ["string", "number"]})).toBe("string|number");
    expect(getSchemaTypeLabel({type: "string", format: "uuid", nullable: true})).toBe("string (uuid) | null");
  });

  it("infers the type when the schema has none", () => {
    expect(getSchemaTypeLabel({properties: {}})).toBe("object");
  });
});

describe("inferSchemaType", () => {
  it("reads the shape in order: properties, items, allOf, oneOf, anyOf", () => {
    expect(inferSchemaType({properties: {}, items: {}})).toBe("object");
    expect(inferSchemaType({items: {}})).toBe("array");
    expect(inferSchemaType({allOf: []})).toBe("allOf");
    expect(inferSchemaType({oneOf: []})).toBe("oneOf");
    expect(inferSchemaType({anyOf: []})).toBe("anyOf");
    expect(inferSchemaType({})).toBe("unknown");
  });
});

describe("formatLiteral", () => {
  it("wraps strings, numbers, booleans and null in backticks", () => {
    expect(formatLiteral("ready")).toBe("`ready`");
    expect(formatLiteral(3)).toBe("`3`");
    expect(formatLiteral(false)).toBe("`false`");
    expect(formatLiteral(null)).toBe("`null`");
    expect(formatLiteral({a: 1})).toBe('`{"a":1}`');
  });

  it("[property] always returns one backtick-wrapped value", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const formatted = formatLiteral(value);
        expect(formatted.startsWith("`") && formatted.endsWith("`")).toBe(true);
      })
    );
  });
});

describe("appendSchemaNode", () => {
  it("lists fields sorted by name, marking required ones with *", () => {
    expect(
      render({type: "object", required: ["id"], properties: {title: {type: "string"}, id: {type: "string", description: "The <br/> id"}}})
    ).toEqual(["- `body*`: object", "  - Fields:", "    - `id*`: string - The id", "    - `title`: string"]);
  });

  it("lists enum values", () => {
    expect(render({type: "string", enum: ["ready", "failed"]})).toEqual(["- `body*`: string", "  - Enum: `ready`, `failed`"]);
  });

  it("renders array items, composites and additional properties", () => {
    expect(render({type: "array", items: {type: "string"}})).toEqual(["- `body*`: array", "  - Items:", "    - `item*`: string"]);
    expect(render({oneOf: [{type: "string"}]})).toEqual(["- `body*`: oneOf", "  - One of:", "    - `oneOf[0]*`: string"]);
    expect(render({allOf: [{type: "string"}]})).toEqual(["- `body*`: allOf", "  - All of:", "    - `allOf[0]*`: string"]);
    expect(render({anyOf: [{type: "number"}]})).toEqual(["- `body*`: anyOf", "  - Any of:", "    - `anyOf[0]*`: number"]);
    expect(render({type: "object", additionalProperties: true})).toEqual(["- `body*`: object", "  - Additional properties: allowed"]);
    expect(render({type: "object", additionalProperties: {type: "number"}})).toEqual([
      "- `body*`: object",
      "  - Additional properties:",
      "    - `<key>*`: number",
    ]);
  });

  it("skips empty enum and composite lists", () => {
    expect(render({type: "string", enum: []})).toEqual(["- `body*`: string"]);
    expect(render({oneOf: []})).toEqual(["- `body*`: oneOf"]);
  });

  it("skips a falsy property schema and a null additionalProperties", () => {
    expect(render({type: "object", properties: {bad: undefined, good: {type: "string"}}})).toEqual([
      "- `body*`: object",
      "  - Fields:",
      "    - `good`: string",
    ]);
    expect(render({type: "object", additionalProperties: null})).toEqual(["- `body*`: object"]);
  });

  it("indents nested items, composites and additional properties", () => {
    expect(render({type: "object", properties: {deep: {type: "array", items: {type: "string"}}}})).toEqual([
      "- `body*`: object",
      "  - Fields:",
      "    - `deep`: array",
      "      - Items:",
      "        - `item*`: string",
    ]);
    expect(render({type: "object", properties: {choice: {oneOf: [{type: "string"}]}}})).toEqual([
      "- `body*`: object",
      "  - Fields:",
      "    - `choice`: oneOf",
      "      - One of:",
      "        - `oneOf[0]*`: string",
    ]);
    expect(render({type: "object", properties: {map: {type: "object", additionalProperties: true}}})).toEqual([
      "- `body*`: object",
      "  - Fields:",
      "    - `map`: object",
      "      - Additional properties: allowed",
    ]);
  });

  it("marks only schema-listed properties as required", () => {
    expect(render({type: "object", properties: {"Stryker was here": {type: "string"}}})).toEqual([
      "- `body*`: object",
      "  - Fields:",
      "    - `Stryker was here`: string",
    ]);
  });

  it("renders a shared object only once across sibling fields", () => {
    const shared: OpenApiSchema = {type: "object", properties: {leaf: {type: "string"}}};
    expect(render({type: "object", properties: {a: shared, b: shared}})).toEqual([
      "- `body*`: object",
      "  - Fields:",
      "    - `a`: object",
      "      - Fields:",
      "        - `leaf`: string",
      "    - `b`: object",
    ]);
  });

  it("renders children of a first-seen $ref schema", () => {
    const lines: string[] = [];
    const context = createSchemaContext(lines);
    appendSchemaNode({$ref: "#/x", properties: {a: {type: "string"}}}, context, {depth: 0, name: "r", required: false});
    expect(lines).toEqual(["- `r`: ref<x>", "  - Fields:", "    - `a`: string"]);
  });

  it("does not render children of an already-seen $ref", () => {
    const lines: string[] = [];
    const context = createSchemaContext(lines);
    appendSchemaNode({$ref: "#/x", properties: {a: {type: "string"}}}, context, {depth: 0, name: "r", required: false});
    appendSchemaNode({$ref: "#/x", properties: {b: {type: "number"}}}, context, {depth: 0, name: "s", required: false});
    expect(lines).toEqual(["- `r`: ref<x>", "  - Fields:", "    - `a`: string", "- `s`: ref<x>", "  - Circular reference: `#/x`"]);
  });

  it("stops at a circular $ref instead of recursing forever", () => {
    const lines: string[] = [];
    const context = createSchemaContext(lines);
    const ref = "#/components/schemas/Node";
    appendSchemaNode({$ref: ref}, context, {depth: 0, name: "a", required: false});
    appendSchemaNode({$ref: ref}, context, {depth: 0, name: "b", required: false});
    expect(lines).toEqual(["- `a`: ref<Node>", "- `b`: ref<Node>", "  - Circular reference: `#/components/schemas/Node`"]);
  });

  it("stops at an object it has already rendered", () => {
    const node: OpenApiSchema = {type: "object", properties: {}};
    node.properties = {self: node};
    expect(render(node)).toEqual(["- `body*`: object", "  - Fields:", "    - `self`: object"]);
  });
});
