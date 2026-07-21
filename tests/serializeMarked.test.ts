import { describe, expect, it } from "vitest";
import { serializeMarked } from "../src/serializeMarked";
import { generateTagged } from "../src/generateTagged";

describe("serializeMarked", () => {
  it("eq with marks → inner tags, no del/ins", () => {
    expect(serializeMarked([{ type: "eq", text: "반드시", marks: "b" }])).toBe(
      "<strong>반드시</strong>",
    );
  });
  it("add wraps ins outside, marks inside", () => {
    expect(serializeMarked([{ type: "add", text: "반드시", marks: "b" }])).toBe(
      "<ins><strong>반드시</strong></ins>",
    );
  });
  it("del likewise", () => {
    expect(serializeMarked([{ type: "del", text: "x", marks: "" }])).toBe(
      "<del>x</del>",
    );
  });
});

describe("generateTagged with formatting", () => {
  it("format-only change → del(plain)+ins(bold)", () => {
    expect(
      generateTagged("오늘까지 전달", "<strong>오늘까지</strong> 전달"),
    ).toBe("<del>오늘까지</del><ins><strong>오늘까지</strong></ins> 전달");
  });
});
