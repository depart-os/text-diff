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
