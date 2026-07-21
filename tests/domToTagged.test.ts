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
});
