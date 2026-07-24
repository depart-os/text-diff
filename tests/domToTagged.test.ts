// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { domToTagged } from "../src/dom/domToTagged";

function el(html: string): HTMLElement {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d;
}

describe("domToTagged", () => {
  it("serializes strong/em/u", () => {
    expect(domToTagged(el("전달 <strong>반드시</strong> 오늘"))).toBe(
      "전달 <strong>반드시</strong> 오늘",
    );
  });
  it("normalizes <b>/<i> and inline-style bold", () => {
    expect(
      domToTagged(el('<b>x</b><span style="font-weight:700">y</span>')),
    ).toBe("<strong>x</strong><strong>y</strong>");
  });
  it("escapes literal angle brackets", () => {
    expect(domToTagged(el("5 &lt; 10"))).toBe("5 &lt; 10");
  });
  it("drops unknown wrapper but keeps children", () => {
    expect(domToTagged(el('<div class="x">a<strong>b</strong></div>'))).toBe(
      "a<strong>b</strong>",
    );
  });
  it("converts <br> to newline", () => {
    expect(domToTagged(el("line1<br>line2"))).toBe("line1\nline2");
  });
  it("records Enter-created div blocks as newlines (Chrome)", () => {
    expect(domToTagged(el("line1<div>line2</div><div>line3</div>"))).toBe(
      "line1\nline2\nline3",
    );
  });
  it("records empty line (div with placeholder br)", () => {
    expect(
      domToTagged(el("line1<div><br></div><div>line2</div>")),
    ).toBe("line1\n\nline2");
  });
  it("ignores trailing padding br inside a block", () => {
    expect(domToTagged(el("<div>line1<br></div><div>line2</div>"))).toBe(
      "line1\nline2",
    );
  });
  it("records <p> blocks as newlines", () => {
    expect(domToTagged(el("<p>line1</p><p>line2</p>"))).toBe("line1\nline2");
  });
});
