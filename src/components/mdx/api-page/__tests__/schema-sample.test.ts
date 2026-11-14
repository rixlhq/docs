import fc from "fast-check";
import {describe, expect, it} from "vite-plus/test";
import {m} from "@/paraglide/messages";
import {collectResponseExamples, getRequestExample, normalizeResponseSample} from "../schema-sample";

describe("normalizeResponseSample", () => {
  it("sets the sample's code to the response status", () => {
    expect(normalizeResponseSample({code: 200}, "404")).toEqual({code: 404});
    expect(normalizeResponseSample({code: "200"}, "404")).toEqual({code: 404});
  });

  it("uses the response description as the error message for 4xx and 5xx", () => {
    expect(normalizeResponseSample({error: "string"}, "404", " Video not found ")).toEqual({error: "Video not found"});
  });

  it("keeps the error message below 400", () => {
    expect(normalizeResponseSample({error: "string"}, "200", "OK")).toEqual({error: "string"});
    expect(normalizeResponseSample({error: "string"}, "399", "Redirect")).toEqual({error: "string"});
    expect(normalizeResponseSample({error: "string"}, "400", "Bad request")).toEqual({error: "Bad request"});
  });

  it("returns the same object when nothing changes, and non-objects untouched", () => {
    const sample = {code: 404};
    expect(normalizeResponseSample(sample, "404")).toBe(sample);
    expect(normalizeResponseSample({code: 1}, "default")).toEqual({code: 1});
    expect(normalizeResponseSample([1, 2], "404")).toEqual([1, 2]);
    expect(normalizeResponseSample("text", "404")).toBe("text");
  });

  it("[property] never changes a sample without code or error", () => {
    const record = fc.dictionary(
      fc.string().filter((key) => key !== "code" && key !== "error" && key !== "__proto__"),
      fc.jsonValue()
    );
    fc.assert(
      fc.property(record, fc.integer({min: 100, max: 599}), (sample, status) => {
        expect(normalizeResponseSample(sample, String(status), "Described")).toBe(sample);
      })
    );
  });
});

describe("collectResponseExamples", () => {
  it("lists named examples, labelled by summary or key", () => {
    const examples = collectResponseExamples({
      examples: {ready: {summary: "Ready video", value: {status: "ready"}}, failed: {value: {status: "failed"}}},
    });
    expect(examples).toEqual([
      {label: "Ready video", description: undefined, sample: {status: "ready"}},
      {label: m.apiExampleLabelWithKey({key: "failed"}), description: undefined, sample: {status: "failed"}},
    ]);
  });

  it("uses a single example, then a sample generated from the schema", () => {
    expect(collectResponseExamples({example: {id: 1}})).toEqual([{label: m.apiExampleLabel(), sample: {id: 1}}]);
    expect(collectResponseExamples({schema: {type: "object", properties: {id: {type: "integer"}}}})).toEqual([
      {label: m.apiExampleLabel(), sample: {id: 0}},
    ]);
  });

  it("returns no examples when the media type has nothing to show", () => {
    expect(collectResponseExamples({})).toEqual([]);
  });
});

describe("getRequestExample", () => {
  it("prefers the first named example, then the example, then the schema", () => {
    expect(getRequestExample({examples: {a: {value: 1}, b: {value: 2}}, example: 3})).toBe(1);
    expect(getRequestExample({example: 3})).toBe(3);
    expect(getRequestExample({schema: {type: "string"}})).toBe("string");
    expect(getRequestExample({})).toBeUndefined();
  });
});
