import fc from "fast-check";
import {describe, expect, it} from "vite-plus/test";
import {normalizeInlineText} from "../utils";

describe("normalizeInlineText", () => {
  it("turns <br> tags and runs of whitespace into single spaces", () => {
    expect(normalizeInlineText("  one<br>two<BR />\n\tthree  ")).toBe("one two three");
  });

  it("returns an empty string for no text", () => {
    expect(normalizeInlineText(undefined)).toBe("");
    expect(normalizeInlineText("")).toBe("");
  });

  it("[property] never leaves a <br>, a double space or outer whitespace", () => {
    const piece = fc.constantFrom("a", "b", " ", "\n", "\t", "<br>", "<br/>", "<BR />");
    fc.assert(
      fc.property(
        fc.array(piece).map((parts) => parts.join("")),
        (text) => {
          const result = normalizeInlineText(text);
          expect(result).not.toMatch(/<br|\s{2}|^\s|\s$|[\n\t]/i);
        }
      )
    );
  });
});
