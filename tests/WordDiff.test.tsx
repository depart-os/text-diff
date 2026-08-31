import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WordDiff } from "../src/WordDiff";

describe("WordDiff formatting render", () => {
  it("renders inner bold inside ins mark (diff mode)", () => {
    const html = renderToStaticMarkup(
      <WordDiff content="<ins><strong>x</strong></ins>" mode="diff" />,
    );
    expect(html).toContain("<strong>x</strong>");
    expect(html).toContain("<mark");
  });
  it("after mode shows bold, no del text", () => {
    const html = renderToStaticMarkup(
      <WordDiff
        content="<del>a</del><ins><strong>b</strong></ins>"
        mode="after"
      />,
    );
    expect(html).toContain("<strong>b</strong>");
    expect(html).not.toContain(">a<");
  });
  it("escapes injected script (no raw tag)", () => {
    const html = renderToStaticMarkup(
      <WordDiff content="&lt;script&gt;alert(1)&lt;/script&gt;" mode="after" />,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("특수 줄바꿈 정규화", () => {
  it("U+2028을 LF로 렌더링한다 (whitespace-pre-wrap이 개행 처리)", () => {
    const html = renderToStaticMarkup(
      <WordDiff content={"하나\u2028둘"} mode="after" />,
    );
    expect(html).not.toContain("\u2028");
    expect(html).toContain("하나\n둘");
  });
  it("diff 태그 경계에 걸친 U+2028+LF 쌍이 이중 개행이 되지 않는다", () => {
    const html = renderToStaticMarkup(
      <WordDiff content={"abc\u2028<ins>\n추가</ins>"} mode="after" />,
    );
    expect(html).not.toContain("\u2028");
    expect(html).not.toContain("\n\n");
  });
  it("NBSP를 일반 공백으로 렌더링한다", () => {
    const html = renderToStaticMarkup(
      <WordDiff content={"a\u00a0b"} mode="after" />,
    );
    expect(html).not.toContain("\u00a0");
    expect(html).toContain("a b");
  });
});
