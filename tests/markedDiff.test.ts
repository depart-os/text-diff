import { describe, expect, it } from "vitest";
import { markedDiff } from "../src/markedDiff";
import type { MarkedToken } from "../src/types";

const T = (text: string, marks = ""): MarkedToken => ({ text, marks });

describe("markedDiff", () => {
  it("equal tokens → eq", () => {
    expect(markedDiff([T("a")], [T("a")])).toEqual([
      { type: "eq", text: "a", marks: "" },
    ]);
  });
  it("text change → del + ins with respective marks", () => {
    expect(markedDiff([T("좋은")], [T("나쁜")])).toEqual([
      { type: "del", text: "좋은", marks: "" },
      { type: "add", text: "나쁜", marks: "" },
    ]);
  });
  it("format-only change → del(old) + ins(new) [방법 A]", () => {
    expect(markedDiff([T("오늘")], [T("오늘", "b")])).toEqual([
      { type: "del", text: "오늘", marks: "" },
      { type: "add", text: "오늘", marks: "b" },
    ]);
  });
  it("merges adjacent same type+marks", () => {
    expect(markedDiff([], [T("새", "b"), T("말", "b")])).toEqual([
      { type: "add", text: "새말", marks: "b" },
    ]);
  });
});
