import type { MarkedPart, MarkedToken } from "./types";

const key = (t: MarkedToken) => `${t.text} ${t.marks}`;

export function markedDiff(A: MarkedToken[], B: MarkedToken[]): MarkedPart[] {
  const n = A.length;
  const m = B.length;

  // 비교 키를 토큰당 한 번만 만든다.
  // 이전에는 DP 셀마다 key()를 2번 호출해 문자열을 2개씩 할당했다 —
  // 2200자 캡션(토큰 1115개)이면 셀 124만 개 × 2 = 249만 개.
  const ka = new Array<string>(n);
  const kb = new Array<string>(m);
  for (let i = 0; i < n; i++) ka[i] = key(A[i]);
  for (let j = 0; j < m; j++) kb[j] = key(B[j]);

  // 중첩 배열 대신 평면 Int32Array.
  // number[][]는 포인터로 연결된 배열 n개라 캐시 미스가 잦고 숫자가 박싱되는데,
  // Int32Array는 연속된 메모리에 4바이트 정수로 들어간다.
  // dp[i][j] → dp[i * w + j]
  const w = m + 1;
  const dp = new Int32Array((n + 1) * w);
  for (let i = 1; i <= n; i++) {
    const row = i * w;
    const prev = row - w;
    const kai = ka[i - 1];
    for (let j = 1; j <= m; j++) {
      if (kai === kb[j - 1]) {
        dp[row + j] = dp[prev + j - 1] + 1;
      } else {
        const up = dp[prev + j];
        const left = dp[row + j - 1];
        dp[row + j] = up > left ? up : left;
      }
    }
  }

  const parts: MarkedPart[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (ka[i - 1] === kb[j - 1]) {
      parts.push({ type: "eq", text: A[i - 1].text, marks: A[i - 1].marks });
      i--;
      j--;
    } else if (dp[(i - 1) * w + j] > dp[i * w + j - 1]) {
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
