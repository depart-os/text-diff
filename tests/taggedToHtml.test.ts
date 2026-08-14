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
  it("converts newlines to <br> for the editor", () => {
    expect(taggedToHtml("line1\nline2")).toBe("line1<br>line2");
  });
  it("keeps empty lines as double <br>", () => {
    expect(taggedToHtml("line1\n\nline2")).toBe("line1<br><br>line2");
  });
  it("converts newline inside marks", () => {
    expect(taggedToHtml("<strong>a\nb</strong>")).toBe(
      "<strong>a<br>b</strong>",
    );
  });
});

describe('draft(temp) 태그', () => {
  it('draft 변경은 HTML 변환에서 미적용으로 해소된다', () => {
    expect(
      taggedToHtml('안녕<tmp-del>하세요</tmp-del><tmp-ins>하십니까</tmp-ins>'),
    ).toBe('안녕하세요')
  })
})
