import type { DiffPart } from './types'

const TOKEN_RE = /(\s+|[^\s\w가-힣]+|[\w가-힣]+)/g

function tokenize(input: string): string[] {
  if (!input) return []
  const tokens: string[] = []
  const matches = input.matchAll(TOKEN_RE)
  for (const m of matches) tokens.push(m[0])
  return tokens
}

export function wordDiff(a: string, b: string): DiffPart[] {
  if (a === b) return a ? [{ type: 'eq', text: a }] : []
  const A = tokenize(a)
  const B = tokenize(b)
  const n = A.length
  const m = B.length
  if (n === 0) return b ? [{ type: 'add', text: b }] : []
  if (m === 0) return a ? [{ type: 'del', text: a }] : []

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  )
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        A[i - 1] === B[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const parts: DiffPart[] = []
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    if (A[i - 1] === B[j - 1]) {
      parts.push({ type: 'eq', text: A[i - 1] })
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      parts.push({ type: 'del', text: A[i - 1] })
      i--
    } else {
      parts.push({ type: 'add', text: B[j - 1] })
      j--
    }
  }
  while (i > 0) {
    parts.push({ type: 'del', text: A[i - 1] })
    i--
  }
  while (j > 0) {
    parts.push({ type: 'add', text: B[j - 1] })
    j--
  }
  parts.reverse()

  const merged: DiffPart[] = []
  for (const p of parts) {
    const last = merged[merged.length - 1]
    if (last && last.type === p.type) last.text += p.text
    else merged.push({ ...p })
  }
  return merged
}
