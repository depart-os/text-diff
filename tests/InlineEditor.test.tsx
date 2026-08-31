// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
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

  it("normalizes special separators/NBSP on paste before inserting", () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    const exec = vi.fn();
    document.execCommand = exec;
    const container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
      createRoot(container).render(
        <InlineEditor value="" onChange={vi.fn()} />,
      );
    });
    const editable = container.querySelector("[contenteditable]")!;
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "하나\u2028둘\u00a0셋\u2028\n넷" },
    });
    act(() => {
      editable.dispatchEvent(event);
    });
    expect(exec).toHaveBeenCalledWith("insertText", false, "하나\n둘 셋\n넷");
    container.remove();
  });
});
