import { describe, expect, it } from "vitest";
import { parseTaggedMarked, filterMarkedByMode } from "../src/renderParts";

describe("parseTaggedMarked", () => {
  it("parses ins + inner bold", () => {
    expect(parseTaggedMarked("<ins><strong>x</strong></ins> y")).toEqual([
      { type: "add", text: "x", marks: "b" },
      { type: "eq", text: " y", marks: "" },
    ]);
  });
  it("parses del + eq bold", () => {
    expect(parseTaggedMarked("<del>a</del><strong>b</strong>")).toEqual([
      { type: "del", text: "a", marks: "" },
      { type: "eq", text: "b", marks: "b" },
    ]);
  });
});

describe("filterMarkedByMode", () => {
  const parts = parseTaggedMarked(
    "<del>오늘</del><ins><strong>오늘</strong></ins>",
  );
  it("before → del becomes eq(plain), add removed", () => {
    expect(filterMarkedByMode(parts, "before")).toEqual([
      { type: "eq", text: "오늘", marks: "" },
    ]);
  });
  it("after → add becomes eq(bold), del removed", () => {
    expect(filterMarkedByMode(parts, "after")).toEqual([
      { type: "eq", text: "오늘", marks: "b" },
    ]);
  });
});
