import { describe, expect, it } from "vitest";
import { normalizePlain, normalizeTagged } from "../src/normalizeText";

describe("normalizePlain", () => {
  it("converts U+2028/U+2029 to LF", () => {
    expect(normalizePlain("하나,\u2028둘")).toBe("하나,\n둘");
    expect(normalizePlain("하나,\u2029둘")).toBe("하나,\n둘");
  });
  it("collapses separator+LF mixed pair into one LF", () => {
    expect(normalizePlain("하나,\u2028\n둘")).toBe("하나,\n둘");
    expect(normalizePlain("하나,\n\u2028둘")).toBe("하나,\n둘");
  });
  it("keeps paragraph break LF LF", () => {
    expect(normalizePlain("문단1\n\n문단2")).toBe("문단1\n\n문단2");
  });
  it("converts CR and CRLF to LF", () => {
    expect(normalizePlain("a\r\nb\rc")).toBe("a\nb\nc");
  });
  it("converts NBSP to regular space and strips trailing space before LF", () => {
    expect(normalizePlain("취향이\u00a0\n남는 곳")).toBe("취향이\n남는 곳");
    expect(normalizePlain("a\u00a0b")).toBe("a b");
  });
});

describe("normalizeTagged", () => {
  it("converts U+2028/U+2029/NBSP inside tagged content", () => {
    expect(normalizeTagged("하나\u2028둘")).toBe("하나\n둘");
    expect(normalizeTagged("a\u00a0b")).toBe("a b");
  });
  it("collapses separator+LF pair when adjacent", () => {
    expect(normalizeTagged("하나\u2028\n둘")).toBe("하나\n둘");
  });
  it("collapses separator+LF pair across a diff tag boundary", () => {
    expect(normalizeTagged("abc\u2028<ins>\n추가</ins>")).toBe(
      "abc<ins>\n추가</ins>",
    );
    expect(normalizeTagged("abc\n<ins>\u2028추가</ins>")).toBe(
      "abc<ins>\n추가</ins>",
    );
  });
  it("does not strip trailing spaces (diff content preserved)", () => {
    expect(normalizeTagged("단어 \n다음")).toBe("단어 \n다음");
  });
  it("keeps paragraph break LF LF", () => {
    expect(normalizeTagged("문단1\n\n문단2")).toBe("문단1\n\n문단2");
  });
});
