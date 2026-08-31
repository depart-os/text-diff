import { useMemo, type ReactNode } from "react";
import { parseTaggedMarked, filterMarkedByMode } from "./renderParts";
import { decodeEntities } from "./escape";
import { normalizeTagged } from "./normalizeText";
import { MARK_ORDER } from "./marks";
import type { MarkedPart } from "./types";

export type WordDiffMode = "before" | "after" | "diff";

export interface WordDiffProps {
  content: string;
  mode: WordDiffMode;
  className?: string;
}

const BASE_CLASS =
  "whitespace-pre-wrap text-[14px] leading-[1.75] text-zinc-800";
const ADD_CLASS = "rounded-sm bg-blue-100 px-0.5 text-blue-900";
const DEL_CLASS =
  "rounded-sm bg-rose-50 px-0.5 text-rose-500 line-through decoration-rose-400 decoration-1";

const MARK_TAG: Record<string, "strong" | "em" | "u"> = {
  b: "strong",
  i: "em",
  u: "u",
};

function withMarks(text: string, marks: string): ReactNode {
  let node: ReactNode = decodeEntities(text);
  for (const m of MARK_ORDER) {
    if (marks.includes(m)) {
      const Tag = MARK_TAG[m];
      node = <Tag>{node}</Tag>;
    }
  }
  return node;
}

function renderPart(p: MarkedPart, i: number): ReactNode {
  const inner = withMarks(p.text, p.marks);
  if (p.type === "add")
    return (
      <mark key={i} className={ADD_CLASS}>
        {inner}
      </mark>
    );
  if (p.type === "del")
    return (
      <span key={i} className={DEL_CLASS}>
        {inner}
      </span>
    );
  return <span key={i}>{inner}</span>;
}

export function WordDiff({ content, mode, className }: WordDiffProps) {
  const parts = useMemo(
    () => filterMarkedByMode(parseTaggedMarked(normalizeTagged(content)), mode),
    [content, mode],
  );
  const finalClass = className ? `${BASE_CLASS} ${className}` : BASE_CLASS;
  return <p className={finalClass}>{parts.map(renderPart)}</p>;
}
