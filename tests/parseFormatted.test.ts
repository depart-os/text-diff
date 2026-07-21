import { describe, expect, it } from "vitest";
import { parseFormatted } from "../src/parseFormatted";

describe("parseFormatted", () => {
  it("plain text → tokens with empty marks", () => {
    expect(parseFormatted("안녕 세상")).toEqual([
      { text: "안녕", marks: "" },
      { text: " ", marks: "" },
      { text: "세상", marks: "" },
    ]);
  });
  it("assigns marks inside formatting tags", () => {
    expect(parseFormatted("전달 <strong>반드시</strong> 오늘")).toEqual([
      { text: "전달", marks: "" },
      { text: " ", marks: "" },
      { text: "반드시", marks: "b" },
      { text: " ", marks: "" },
      { text: "오늘", marks: "" },
    ]);
  });
  it("normalizes <b>/<i> aliases and nesting", () => {
    expect(parseFormatted("<b><i>x</i></b>")).toEqual([
      { text: "x", marks: "bi" },
    ]);
  });
  it("treats unknown < as literal text", () => {
    expect(parseFormatted("5 &lt; 10")).toEqual([
      { text: "5", marks: "" },
      { text: " ", marks: "" },
      { text: "&lt;", marks: "" },
      { text: " ", marks: "" },
      { text: "10", marks: "" },
    ]);
  });
});
