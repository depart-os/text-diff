import { describe, expect, it } from "vitest";
import { canonMarks, openTags, closeTags } from "../src/marks";

describe("marks", () => {
  it("canonicalizes to b,i,u order", () => {
    expect(canonMarks(new Set(["u", "b"]))).toBe("bu");
    expect(canonMarks(new Set(["i", "u", "b"]))).toBe("biu");
    expect(canonMarks(new Set())).toBe("");
  });
  it("emits opening tags outer→inner", () => {
    expect(openTags("biu")).toBe("<strong><em><u>");
    expect(openTags("b")).toBe("<strong>");
    expect(openTags("")).toBe("");
  });
  it("emits closing tags inner→outer", () => {
    expect(closeTags("biu")).toBe("</u></em></strong>");
    expect(closeTags("bu")).toBe("</u></strong>");
    expect(closeTags("")).toBe("");
  });
});
