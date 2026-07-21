import type { Mark } from "./types";

export const MARK_ORDER: Mark[] = ["b", "i", "u"];
const OPEN: Record<Mark, string> = { b: "<strong>", i: "<em>", u: "<u>" };
const CLOSE: Record<Mark, string> = { b: "</strong>", i: "</em>", u: "</u>" };

export function canonMarks(active: Set<Mark>): string {
  return MARK_ORDER.filter((m) => active.has(m)).join("");
}

export function openTags(marks: string): string {
  return MARK_ORDER.filter((m) => marks.includes(m))
    .map((m) => OPEN[m])
    .join("");
}

export function closeTags(marks: string): string {
  return [...MARK_ORDER]
    .reverse()
    .filter((m) => marks.includes(m))
    .map((m) => CLOSE[m])
    .join("");
}
