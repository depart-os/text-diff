import type { Mark, MarkedToken } from "./types";
import { canonMarks } from "./marks";

const TAG_AT = /^<(\/?)(strong|b|em|i|u)>/i;
const TOKEN_RE = /(&[a-z]+;|\s+|[^\s\w가-힣]+|[\w가-힣]+)/g;
const ALIAS: Record<string, Mark> = {
  strong: "b",
  b: "b",
  em: "i",
  i: "i",
  u: "u",
};

export function parseFormatted(input: string): MarkedToken[] {
  const tokens: MarkedToken[] = [];
  const active = new Set<Mark>();
  let buf = "";
  let i = 0;

  const flush = () => {
    if (!buf) return;
    const marks = canonMarks(active);
    for (const m of buf.matchAll(TOKEN_RE)) tokens.push({ text: m[0], marks });
    buf = "";
  };

  while (i < input.length) {
    if (input[i] === "<") {
      const mt = input.slice(i).match(TAG_AT);
      if (mt) {
        flush();
        const mk = ALIAS[mt[2].toLowerCase()];
        if (mt[1] === "/") active.delete(mk);
        else active.add(mk);
        i += mt[0].length;
        continue;
      }
    }
    buf += input[i];
    i++;
  }
  flush();
  return tokens;
}
