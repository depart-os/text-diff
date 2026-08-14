import { describe, expect, it } from "vitest";
import { parseTaggedMarked, filterMarkedByMode } from "../src/renderParts";

describe("parseTaggedMarked", () => {
  it("parses ins + inner bold", () => {
    expect(parseTaggedMarked("<ins><strong>x</strong></ins> y")).toEqual([
      { type: "add", text: "x", marks: "b" },
      { type: "eq", text: " y", marks: "" },
    ]);
  });
  it("parses del + eq bold", () => {
    expect(parseTaggedMarked("<del>a</del><strong>b</strong>")).toEqual([
      { type: "del", text: "a", marks: "" },
      { type: "eq", text: "b", marks: "b" },
    ]);
  });
});

describe("filterMarkedByMode", () => {
  const parts = parseTaggedMarked(
    "<del>오늘</del><ins><strong>오늘</strong></ins>",
  );
  it("before → del becomes eq(plain), add removed", () => {
    expect(filterMarkedByMode(parts, "before")).toEqual([
      { type: "eq", text: "오늘", marks: "" },
    ]);
  });
  it("after → add becomes eq(bold), del removed", () => {
    expect(filterMarkedByMode(parts, "after")).toEqual([
      { type: "eq", text: "오늘", marks: "b" },
    ]);
  });
});

describe('draft(temp) 태그', () => {
  const content = 'a<del>x</del><ins>b</ins><tmp-del>d</tmp-del><tmp-ins>c</tmp-ins>'

  it('parseTaggedMarked는 tmp 태그를 draft 파트로 파싱한다', () => {
    expect(parseTaggedMarked('<tmp-ins>새글</tmp-ins>')).toEqual([
      { type: 'add', text: '새글', marks: '', draft: true },
    ])
    expect(parseTaggedMarked('<tmp-del>옛글</tmp-del>')).toEqual([
      { type: 'del', text: '옛글', marks: '', draft: true },
    ])
  })

  it('after 모드는 draft를 미적용으로 해소한다', () => {
    const parts = filterMarkedByMode(parseTaggedMarked(content), 'after')
    expect(parts.map((p) => p.text).join('')).toBe('abd')
    expect(parts.every((p) => p.type === 'eq')).toBe(true)
  })

  it('before 모드는 draft add를 버리고 draft del을 본문으로 유지한다', () => {
    const parts = filterMarkedByMode(parseTaggedMarked(content), 'before')
    expect(parts.map((p) => p.text).join('')).toBe('axd')
  })

  it('diff 모드는 draft 파트를 플래그와 함께 그대로 노출한다', () => {
    const parts = filterMarkedByMode(parseTaggedMarked(content), 'diff')
    expect(parts).toContainEqual({ type: 'add', text: 'c', marks: '', draft: true })
    expect(parts).toContainEqual({ type: 'del', text: 'd', marks: '', draft: true })
  })
})
