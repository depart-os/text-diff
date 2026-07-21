import { parseTaggedMarked, filterMarkedByMode } from "../renderParts";
import { MARK_ORDER } from "../marks";

const OPEN: Record<string, string> = { b: "<strong>", i: "<em>", u: "<u>" };
const CLOSE: Record<string, string> = { b: "</strong>", i: "</em>", u: "</u>" };

export function taggedToHtml(content: string): string {
  const parts = filterMarkedByMode(parseTaggedMarked(content), "after");
  let out = "";
  for (const p of parts) {
    const open = MARK_ORDER.filter((m) => p.marks.includes(m))
      .map((m) => OPEN[m])
      .join("");
    const close = [...MARK_ORDER]
      .reverse()
      .filter((m) => p.marks.includes(m))
      .map((m) => CLOSE[m])
      .join("");
    out += open + p.text + close;
  }
  return out;
}
