import { describe, expect, it } from "vitest";
import { escapeText, decodeEntities } from "../src/escape";

describe("escape", () => {
  it("escapes & < > (& first)", () => {
    expect(escapeText("a<b>&c")).toBe("a&lt;b&gt;&amp;c");
    expect(escapeText("가격 < 100")).toBe("가격 &lt; 100");
  });
  it("decodes entities back", () => {
    expect(decodeEntities("a&lt;b&gt;&amp;c")).toBe("a<b>&c");
  });
  it("round-trips", () => {
    const s = "5 < 10 && x > 3";
    expect(decodeEntities(escapeText(s))).toBe(s);
  });
});
