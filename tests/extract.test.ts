import { describe, expect, it } from "vitest";
import { extractAfter, extractBefore } from "../src/extract";
import { generateTagged } from "../src/generateTagged";

describe("extractBefore", () => {
  it("returns empty string for empty input", () => {
    expect(extractBefore("")).toBe("");
  });

  it("returns plain text unchanged (no-op)", () => {
    expect(extractBefore("hello world")).toBe("hello world");
  });

  it("strips <ins> blocks entirely", () => {
    expect(extractBefore("<ins>new</ins>")).toBe("");
  });

  it("keeps <del> contents", () => {
    expect(extractBefore("<del>old</del>")).toBe("old");
  });

  it("extracts before view from mixed sequence", () => {
    expect(extractBefore("신호<del>일 수 있어요</del><ins>입니다</ins>")).toBe(
      "신호일 수 있어요",
    );
  });

  it("preserves eq blocks", () => {
    expect(extractBefore("a<del>x</del><ins>y</ins>b")).toBe("axb");
  });
});

describe("extractAfter", () => {
  it("returns empty string for empty input", () => {
    expect(extractAfter("")).toBe("");
  });

  it("returns plain text unchanged (no-op)", () => {
    expect(extractAfter("hello world")).toBe("hello world");
  });

  it("strips <del> blocks entirely", () => {
    expect(extractAfter("<del>old</del>")).toBe("");
  });

  it("keeps <ins> contents", () => {
    expect(extractAfter("<ins>new</ins>")).toBe("new");
  });

  it("extracts after view from mixed sequence", () => {
    expect(extractAfter("신호<del>일 수 있어요</del><ins>입니다</ins>")).toBe(
      "신호입니다",
    );
  });

  it("preserves eq blocks", () => {
    expect(extractAfter("a<del>x</del><ins>y</ins>b")).toBe("ayb");
  });
});

describe("round-trip with generateTagged", () => {
  it("extractBefore(generateTagged(a, b)) === a", () => {
    const a = "안녕 세상";
    const b = "안녕 친구야";
    expect(extractBefore(generateTagged(a, b))).toBe(a);
  });

  it("extractAfter(generateTagged(a, b)) === b", () => {
    const a = "안녕 세상";
    const b = "안녕 친구야";
    expect(extractAfter(generateTagged(a, b))).toBe(b);
  });

  it("handles empty before", () => {
    const tagged = generateTagged("", "신규");
    expect(extractBefore(tagged)).toBe("");
    expect(extractAfter(tagged)).toBe("신규");
  });

  it("handles empty after", () => {
    const tagged = generateTagged("삭제", "");
    expect(extractBefore(tagged)).toBe("삭제");
    expect(extractAfter(tagged)).toBe("");
  });

  it("handles no change (eq only)", () => {
    const tagged = generateTagged("hello", "hello");
    expect(extractBefore(tagged)).toBe("hello");
    expect(extractAfter(tagged)).toBe("hello");
  });
});

describe("extract with nested formatting", () => {
  const tagged = "<del>오늘까지</del><ins><strong>오늘까지</strong></ins> 전달";
  it("extractBefore keeps del side (plain)", () => {
    expect(extractBefore(tagged)).toBe("오늘까지 전달");
  });
  it("extractAfter keeps ins side (with formatting)", () => {
    expect(extractAfter(tagged)).toBe("<strong>오늘까지</strong> 전달");
  });
  it("eq formatting passes through both sides", () => {
    const eq = "전달 <strong>반드시</strong> 오늘";
    expect(extractBefore(eq)).toBe(eq);
    expect(extractAfter(eq)).toBe(eq);
  });
});
