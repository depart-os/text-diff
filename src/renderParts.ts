import type { Mark, MarkedPart, DiffPartType } from "./types";
import type { WordDiffMode } from "./WordDiff";
import { canonMarks } from "./marks";

const TOKEN =
  /<(\/?)(strong|b|em|i|u|del|ins)>|([\s\S]+?)(?=<(?:\/?)(?:strong|b|em|i|u|del|ins)>|$)/gi;
const MARK_ALIAS: Record<string, Mark> = {
  strong: "b",
  b: "b",
  em: "i",
  i: "i",
  u: "u",
};

export function parseTaggedMarked(content: string): MarkedPart[] {
  const parts: MarkedPart[] = [];
  const marks = new Set<Mark>();
  let type: DiffPartType = "eq";
  for (const m of content.matchAll(TOKEN)) {
    const [, slash, tag, text] = m;
    if (tag) {
      const t = tag.toLowerCase();
      if (t === "del" || t === "ins") {
        type = slash ? "eq" : t === "ins" ? "add" : "del";
      } else {
        const mk = MARK_ALIAS[t];
        if (slash) marks.delete(mk);
        else marks.add(mk);
      }
    } else if (text) {
      const cm = canonMarks(marks);
      const last = parts[parts.length - 1];
      if (last && last.type === type && last.marks === cm) last.text += text;
      else parts.push({ type, text, marks: cm });
    }
  }
  return parts;
}

export function filterMarkedByMode(
  parts: MarkedPart[],
  mode: WordDiffMode,
): MarkedPart[] {
  if (mode === "before") {
    return parts
      .filter((p) => p.type !== "add")
      .map((p) => (p.type === "del" ? { ...p, type: "eq" as const } : p));
  }
  if (mode === "after") {
    return parts
      .filter((p) => p.type !== "del")
      .map((p) => (p.type === "add" ? { ...p, type: "eq" as const } : p));
  }
  return parts;
}
