import type { MarkedPart } from "./types";
import { openTags, closeTags } from "./marks";

export function serializeMarked(
  parts: MarkedPart[],
  options?: { draft?: boolean },
): string {
  const [ins, del] = options?.draft
    ? (["tmp-ins", "tmp-del"] as const)
    : (["ins", "del"] as const);
  let out = "";
  for (const p of parts) {
    const inner = openTags(p.marks) + p.text + closeTags(p.marks);
    if (p.type === "eq") out += inner;
    else if (p.type === "add") out += `<${ins}>${inner}</${ins}>`;
    else out += `<${del}>${inner}</${del}>`;
  }
  return out;
}
