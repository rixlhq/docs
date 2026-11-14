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
    expect(body?.schema?.required).toEqual(["file"]);
    expect(Object.keys(body?.schema?.properties ?? {})).toEqual(["file", "title"]);
  });

  it("drops an entry that repeats one already listed", () => {
    const bodies = getRequestBodies({
      requestBody: {content: {"application/json": {schema: {type: "string"}}}},
      parameters: [{in: "body", schema: {type: "string"}}],
    });
    expect(bodies).toHaveLength(1);
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

  it("says n/a for a response without a body", () => {
    expect(getResponseContents({description: "No content"}, undefined)).toEqual([{contentType: "n/a"}]);
  });
});
