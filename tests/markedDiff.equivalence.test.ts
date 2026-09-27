import { describe, expect, it } from "vitest";
import { markedDiff } from "../src/markedDiff";
import { generateTagged } from "../src/generateTagged";
import type { MarkedPart, MarkedToken } from "../src/types";

/**
 * key 캐싱 + Int32Array 최적화 이전의 구현.
 * 최적화는 자료구조만 바꾼 것이므로 출력이 바이트 단위로 같아야 한다.
 * 이 참조 구현과 대조해 그 불변식을 강제한다.
 */
function markedDiffLegacy(A: MarkedToken[], B: MarkedToken[]): MarkedPart[] {
  const key = (t: MarkedToken) => `${t.text} ${t.marks}`;
  const n = A.length;
  const m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        key(A[i - 1]) === key(B[j - 1])
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const parts: MarkedPart[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (key(A[i - 1]) === key(B[j - 1])) {
      parts.push({ type: "eq", text: A[i - 1].text, marks: A[i - 1].marks });
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      parts.push({ type: "del", text: A[i - 1].text, marks: A[i - 1].marks });
      i--;
    } else {
      parts.push({ type: "add", text: B[j - 1].text, marks: B[j - 1].marks });
      j--;
    }
  }
  while (i > 0) {
    parts.push({ type: "del", text: A[i - 1].text, marks: A[i - 1].marks });
    i--;
  }
  while (j > 0) {
    parts.push({ type: "add", text: B[j - 1].text, marks: B[j - 1].marks });
    j--;
  }
  parts.reverse();
  const merged: MarkedPart[] = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last && last.type === p.type && last.marks === p.marks)
      last.text += p.text;
    else merged.push({ ...p });
  }
  return merged;
}

const T = (text: string, marks = ""): MarkedToken => ({ text, marks });

/** 재현 가능한 의사난수 (mulberry32) — 실패 시 시드로 그대로 재현 */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORDS = [
  "오늘은", "여러분께", "특별한", "소식을", "전해드립니다", "저희", "브랜드는",
  "고객님의", "일상에", "작은", "행복을", "더하기", "위해", "노력하고", "있어요",
  "hello", "world", ",", ".", " ", "!", "2024", "new",
];
const MARKS = ["", "b", "i", "u", "bi", "bu", "iu", "biu"];

function randomTokens(rand: () => number, len: number): MarkedToken[] {
  const out: MarkedToken[] = [];
  for (let k = 0; k < len; k++) {
    out.push(
      T(
        WORDS[Math.floor(rand() * WORDS.length)],
        MARKS[Math.floor(rand() * MARKS.length)],
      ),
    );
  }
  return out;
}

describe("markedDiff — 최적화 전후 출력 동일성", () => {
  it("경계 입력에서 참조 구현과 일치한다", () => {
    const cases: [MarkedToken[], MarkedToken[]][] = [
      [[], []],
      [[], [T("새")]],
      [[T("옛")], []],
      [[T("a")], [T("a")]],
      [[T("오늘")], [T("오늘", "b")]],
      [[T("좋은")], [T("나쁜")]],
      [
        [T("같은"), T(" "), T("말")],
        [T("같은"), T(" "), T("글")],
      ],
      // 동점(tie) 경로 — dp[i-1][j] === dp[i][j-1] 일 때 add 쪽으로 기우는 규칙
      [
        [T("a"), T("b")],
        [T("b"), T("a")],
      ],
      [
        [T("x"), T("y"), T("z")],
        [T("z"), T("y"), T("x")],
      ],
    ];

    for (const [a, b] of cases) {
      expect(markedDiff(a, b)).toEqual(markedDiffLegacy(a, b));
    }
  });

  it("무작위 입력 300쌍에서 참조 구현과 일치한다", () => {
    const rand = rng(20260927);
    for (let t = 0; t < 300; t++) {
      const a = randomTokens(rand, Math.floor(rand() * 40));
      const b = randomTokens(rand, Math.floor(rand() * 40));
      const got = markedDiff(a, b);
      const want = markedDiffLegacy(a, b);
      // 실패 시 어떤 입력이었는지 바로 보이도록 입력을 메시지에 싣는다
      expect(got, `A=${JSON.stringify(a)}\nB=${JSON.stringify(b)}`).toEqual(
        want,
      );
    }
  });

  it("긴 입력(토큰 400개)에서도 일치한다", () => {
    const rand = rng(1234);
    const a = randomTokens(rand, 400);
    const b = a.map((t, i) =>
      i % 7 === 0 ? T(t.text, i % 2 ? "b" : "i") : t,
    );
    expect(markedDiff(a, b)).toEqual(markedDiffLegacy(a, b));
  });
});

describe("markedDiff — 불변식", () => {
  it("eq+del 을 이으면 원본, eq+add 를 이으면 수정본이 복원된다", () => {
    const rand = rng(777);
    for (let t = 0; t < 100; t++) {
      const a = randomTokens(rand, Math.floor(rand() * 30));
      const b = randomTokens(rand, Math.floor(rand() * 30));
      const parts = markedDiff(a, b);

      const before = parts
        .filter((p) => p.type !== "add")
        .map((p) => p.text)
        .join("");
      const after = parts
        .filter((p) => p.type !== "del")
        .map((p) => p.text)
        .join("");

      expect(before).toBe(a.map((t) => t.text).join(""));
      expect(after).toBe(b.map((t) => t.text).join(""));
    }
  });

  it("인접한 두 part 는 type+marks 가 같을 수 없다", () => {
    const rand = rng(31337);
    for (let t = 0; t < 100; t++) {
      const parts = markedDiff(
        randomTokens(rand, Math.floor(rand() * 30)),
        randomTokens(rand, Math.floor(rand() * 30)),
      );
      for (let i = 1; i < parts.length; i++) {
        const same =
          parts[i].type === parts[i - 1].type &&
          parts[i].marks === parts[i - 1].marks;
        expect(same).toBe(false);
      }
    }
  });

  it("generateTagged 라운드트립이 유지된다", () => {
    expect(generateTagged("안녕 세상", "안녕 친구야")).toBe(
      "안녕 <del>세상</del><ins>친구야</ins>",
    );
    expect(generateTagged("오늘", "<strong>오늘</strong>")).toBe(
      "<del>오늘</del><ins><strong>오늘</strong></ins>",
    );
    expect(generateTagged("같음", "같음")).toBe("같음");
  });
});
