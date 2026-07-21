import type { MarkedPart, MarkedToken } from "./types";

const key = (t: MarkedToken) => `${t.text} ${t.marks}`;

export function markedDiff(A: MarkedToken[], B: MarkedToken[]): MarkedPart[] {
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
