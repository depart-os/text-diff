// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InlineEditor } from "../src/InlineEditor";

describe("InlineEditor", () => {
  it("renders toolbar buttons and editable region with initial value", () => {
    const html = renderToStaticMarkup(
      <InlineEditor value="전달 <strong>반드시</strong>" onChange={vi.fn()} />,
    );
    expect(html.toLowerCase()).toContain("contenteditable");
    expect(html).toContain('data-mark="b"');
    expect(html).toContain('data-mark="i"');
    expect(html).toContain('data-mark="u"');
  });
});
