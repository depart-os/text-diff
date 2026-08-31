import { escapeText } from "../escape";

function isBold(s: CSSStyleDeclaration): boolean {
  return s.fontWeight === "bold" || Number(s.fontWeight) >= 600;
}

const BLOCK_TAG = /^(?:div|p)$/;

function isBlock(node: Node): boolean {
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    BLOCK_TAG.test((node as HTMLElement).tagName.toLowerCase())
  );
}

function serializeChildren(node: Node): string {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      // contenteditable은 연속·줄 끝 공백을 보존하려고 NBSP를 스스로 만든다 —
      // 저장 문자열에는 일반 공백만 남긴다
      out += escapeText((child.textContent ?? "").replace(/\u00a0/g, " "));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const eln = child as HTMLElement;
    const tag = eln.tagName.toLowerCase();
    if (tag === "br") {
      // 블록 마지막의 br은 브라우저가 넣는 자리표시자(빈 줄·줄 끝 패딩) —
      // 줄바꿈은 블록 경계가 담당하므로 건너뛴다.
      if (isBlock(node) && !eln.nextSibling) return;
      out += "\n";
      return;
    }
    if (BLOCK_TAG.test(tag)) {
      // contenteditable에서 Enter는 div/p 블록을 만든다 — 블록 시작 = 줄바꿈
      if (out) out += "\n";
      out += serializeChildren(eln);
      return;
    }
    const style = eln.style;
    const inner = serializeChildren(eln);
    if (tag === "strong" || tag === "b" || isBold(style))
      out += `<strong>${inner}</strong>`;
    else if (tag === "em" || tag === "i" || style.fontStyle === "italic")
      out += `<em>${inner}</em>`;
    else if (tag === "u" || style.textDecoration.includes("underline"))
      out += `<u>${inner}</u>`;
    else out += inner;
  });
  return out;
}

export function domToTagged(root: HTMLElement): string {
  return serializeChildren(root);
}
