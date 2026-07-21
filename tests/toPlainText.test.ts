import { describe, expect, it } from "vitest";
import { toPlainText } from "../src/toPlainText";

describe("toPlainText", () => {
  it("plain text passes through", () => {
    expect(toPlainText("안녕 세상")).toBe("안녕 세상");
  });
  it("strips formatting tags, keeps text", () => {
    expect(toPlainText("전달 <strong>반드시</strong> 오늘")).toBe(
      "전달 반드시 오늘",
    );
    expect(toPlainText("<strong><em>x</em></strong> <u>y</u>")).toBe("x y");
  });
  it("resolves diff to after view then strips formatting", () => {
    expect(
      toPlainText(
        "<del>오늘까지</del><ins><strong>내일까지</strong></ins> 전달",
      ),
    ).toBe("내일까지 전달");
  });
  it("decodes escaped entities", () => {
    expect(toPlainText("5 &lt; 10 &amp;&amp; x &gt; 3")).toBe(
      "5 < 10 && x > 3",
    );
  });
});
