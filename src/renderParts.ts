import type { Mark, MarkedPart, DiffPartType } from "./types";
import type { WordDiffMode } from "./WordDiff";
import { canonMarks } from "./marks";

const TOKEN =
  /<(\/?)(strong|b|em|i|u|del|ins|tmp-del|tmp-ins)>|([\s\S]+?)(?=<(?:\/?)(?:strong|b|em|i|u|del|ins|tmp-del|tmp-ins)>|$)/gi;
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
  let draft = false;
  for (const m of content.matchAll(TOKEN)) {
    const [, slash, tag, text] = m;
    if (tag) {
      const t = tag.toLowerCase();
      if (t === "del" || t === "ins" || t === "tmp-del" || t === "tmp-ins") {
        if (slash) {
          type = "eq";
          draft = false;
        } else {
          type = t.endsWith("ins") ? "add" : "del";
          draft = t.startsWith("tmp-");
        }
      } else {
        const mk = MARK_ALIAS[t];
        if (slash) marks.delete(mk);
        else marks.add(mk);
      }
    } else if (text) {
      const cm = canonMarks(marks);
      const last = parts[parts.length - 1];
      if (
        last &&
        last.type === type &&
        last.marks === cm &&
        (last.draft === true) === draft
      ) {
        last.text += text;
      } else {
        parts.push(
          draft ? { type, text, marks: cm, draft } : { type, text, marks: cm },
        );
      }
    }
  }
  return parts;
}

// draft 파트는 미제출 변경이므로 어느 모드에서도 적용하지 않는다.
// draft를 적용한 결과가 필요하면 extractDraft를 쓴다.
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
      .filter((p) => (p.draft ? p.type !== "add" : p.type !== "del"))
      .map((p) => (p.type === "eq" ? p : { ...p, type: "eq" as const }));
  }
  return parts;
}
