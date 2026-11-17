import {describe, expect, it} from "vite-plus/test";
import {getRequestBodies, getResponseContents} from "../openapi-request";

describe("getRequestBodies", () => {
  it("reads OpenAPI 3 requestBody content per content type", () => {
    const bodies = getRequestBodies({
      requestBody: {required: true, description: "The video", content: {"application/json": {schema: {type: "object"}}}},
    });
    expect(bodies).toEqual([{contentType: "application/json", required: true, description: "The video", schema: {type: "object"}}]);
  });

  it("assumes JSON for a requestBody without content", () => {
    expect(getRequestBodies({requestBody: {}})).toEqual([{contentType: "application/json", required: false, description: undefined}]);
  });

  it("reads Swagger 2 body parameters for each consumed type", () => {
    const bodies = getRequestBodies({
      consumes: ["application/json", "application/xml"],
      parameters: [{in: "body", name: "payload", required: true, schema: {type: "object"}}],
    });
    expect(bodies.map((body) => body.contentType)).toEqual(["application/json", "application/xml"]);
  });

  it("collects Swagger 2 formData parameters into one object schema", () => {
    const [body] = getRequestBodies({
      parameters: [
        {in: "formData", name: "file", type: "file", required: true},
        {in: "formData", name: "title", type: "string"},
        {in: "query", name: "ignored", type: "string"},
      ],
    });
    expect(body?.contentType).toBe("multipart/form-data");
    expect(body?.required).toBe(true);
    expect(body?.schema?.type).toBe("object");
    expect(body?.schema?.required).toEqual(["file"]);
    expect(body?.schema?.properties?.file).toEqual({type: "file", format: undefined, description: undefined, enum: undefined});
    expect(Object.keys(body?.schema?.properties ?? {})).toEqual(["file", "title"]);
  });

  it("reads a requestBody content entry without a media object", () => {
    expect(getRequestBodies({requestBody: {content: {"application/json": undefined}}})).toEqual([
      {contentType: "application/json", required: false, description: undefined, schema: undefined},
    ]);
  });

  it("defaults to JSON for body parameters when consumes is missing or empty", () => {
    const bodies = getRequestBodies({parameters: [{in: "body", name: "payload", schema: {type: "object"}}]});
    expect(bodies.map((body) => body.contentType)).toEqual(["application/json"]);

    const emptyConsumes = getRequestBodies({consumes: [], parameters: [{in: "body", name: "payload", schema: {type: "object"}}]});
    expect(emptyConsumes.map((body) => body.contentType)).toEqual(["application/json"]);
  });

  it("uses the operation consumes types for formData instead of the multipart default", () => {
    const bodies = getRequestBodies({consumes: ["application/xml"], parameters: [{in: "formData", name: "x", type: "string"}]});
    expect(bodies.map((body) => body.contentType)).toEqual(["application/xml"]);
  });

  it("ignores a formData parameter without a name and marks the body optional", () => {
    const [body] = getRequestBodies({
      parameters: [
        {in: "formData", type: "string"},
        {in: "formData", name: "ok", type: "string"},
      ],
    });
    expect(Object.keys(body?.schema?.properties ?? {})).toEqual(["ok"]);
    expect(body?.required).toBe(false);
  });

  it("keeps bodies apart when only the description differs", () => {
    const bodies = getRequestBodies({
      requestBody: {description: "one", content: {"application/json": {schema: {type: "string"}}}},
      parameters: [{in: "body", description: "two", schema: {type: "string"}}],
    });
    expect(bodies).toHaveLength(2);
  });

  it("keeps a missing description distinct from a literal one", () => {
    const bodies = getRequestBodies({
      requestBody: {content: {"application/json": {schema: {type: "string"}}}},
      parameters: [{in: "body", description: "Stryker was here!", schema: {type: "string"}}],
    });
    expect(bodies).toHaveLength(2);
  });

  it("signs an array type differently from a comma-joined string type", () => {
    const bodies = getRequestBodies({
      requestBody: {content: {"application/json": {schema: {type: ["a", "b"]}}}},
      parameters: [{in: "body", schema: {type: "a,b"}}],
    });
    expect(bodies).toHaveLength(2);
  });

  it("signs a declared type differently from an inferred one", () => {
    const bodies = getRequestBodies({
      requestBody: {content: {"application/json": {schema: {type: "string"}}}},
      parameters: [{in: "body", schema: {type: "unknown"}}],
    });
    expect(bodies).toHaveLength(2);
  });

  it("signs enum and format presence differently", () => {
    const bodies = getRequestBodies({
      requestBody: {content: {"application/json": {schema: {type: "string", enum: ["a"], format: "uuid"}}}},
      parameters: [{in: "body", schema: {type: "string", enum: ["a"]}}],
    });
    expect(bodies).toHaveLength(2);
  });

  it("keeps a literal format distinct from a missing one", () => {
    const bodies = getRequestBodies({
      requestBody: {content: {"application/json": {schema: {type: "string"}}}},
      parameters: [{in: "body", schema: {type: "string", format: "Stryker was here!"}}],
    });
    expect(bodies).toHaveLength(2);
  });
});

describe("getResponseContents", () => {
  it("lists OpenAPI 3 content per type", () => {
    expect(getResponseContents({content: {"application/json": {schema: {type: "object"}}}}, undefined)).toEqual([
      {contentType: "application/json", schema: {type: "object"}},
    ]);
  });

  it("lists a Swagger 2 schema for each produced type, JSON by default", () => {
    expect(getResponseContents({schema: {type: "string"}}, ["text/plain"]).map((entry) => entry.contentType)).toEqual(["text/plain"]);
    expect(getResponseContents({schema: {type: "string"}}, []).map((entry) => entry.contentType)).toEqual(["application/json"]);
  });

  it("reads a content entry without a media object", () => {
    expect(getResponseContents({content: {"text/plain": undefined}}, undefined)).toEqual([{contentType: "text/plain", schema: undefined}]);
  });

  it("skips an empty content map", () => {
    expect(getResponseContents({content: {}}, undefined)).toEqual([{contentType: "n/a"}]);
  });

  it("keeps different content types separate", () => {
    expect(getResponseContents({content: {"application/json": {}, "text/plain": {}}}, undefined)).toHaveLength(2);
  });

  it("dedupes repeated produced types", () => {
    expect(getResponseContents({schema: {type: "string"}}, ["application/json", "application/json"])).toHaveLength(1);
  });

  it("keeps a response schema distinct from a content schema", () => {
    const contents = getResponseContents({content: {"application/json": {schema: {type: "string"}}}, schema: {type: "object"}}, [
      "application/json",
    ]);
    expect(contents).toHaveLength(2);
  });

  it("says n/a for a response without a body", () => {
    expect(getResponseContents({description: "No content"}, undefined)).toEqual([{contentType: "n/a"}]);
  });
});
