import { escapeText } from "../escape";

function isBold(s: CSSStyleDeclaration): boolean {
  return s.fontWeight === "bold" || Number(s.fontWeight) >= 600;
}

function serializeChildren(node: Node): string {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += escapeText(child.textContent ?? "");
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const eln = child as HTMLElement;
    const tag = eln.tagName.toLowerCase();
    if (tag === "br") {
      out += "\n";
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
