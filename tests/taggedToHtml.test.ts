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

describe("특수 줄바꿈 정규화", () => {
  it("U+2028을 <br>로 복원한다", () => {
    expect(taggedToHtml("하나\u2028둘")).toBe("하나<br>둘");
  });
  it("U+2028+LF 중복 쌍은 <br> 하나가 된다", () => {
    expect(taggedToHtml("하나\u2028\n둘")).toBe("하나<br>둘");
  });
  it("NBSP를 일반 공백으로 바꾼다", () => {
    expect(taggedToHtml("a\u00a0b")).toBe("a b");
  });
});

describe('draft(temp) 태그', () => {
  it('draft 변경은 HTML 변환에서 미적용으로 해소된다', () => {
    expect(
      taggedToHtml('안녕<tmp-del>하세요</tmp-del><tmp-ins>하십니까</tmp-ins>'),
    ).toBe('안녕하세요')
  })
})
