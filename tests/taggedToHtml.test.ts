import { describe, expect, it } from "vitest";
import { taggedToHtml } from "../src/dom/taggedToHtml";

describe("taggedToHtml", () => {
  it("formatted after-string → editor html", () => {
    expect(taggedToHtml("전달 <strong>반드시</strong> 오늘")).toBe(
      "전달 <strong>반드시</strong> 오늘",
    );
  });
  it("collapses ins to plain formatted, drops del (after view)", () => {
    expect(taggedToHtml("<del>a</del><ins><strong>b</strong></ins>")).toBe(
      "<strong>b</strong>",
    );
  });
  it("keeps escaped entities intact", () => {
    expect(taggedToHtml("5 &lt; 10")).toBe("5 &lt; 10");
  });
});
