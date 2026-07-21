import { useEffect, useRef, type CSSProperties } from "react";
import { domToTagged } from "./dom/domToTagged";
import { taggedToHtml } from "./dom/taggedToHtml";
import type { Mark } from "./types";

export interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  marks?: Mark[];
}

const LABEL: Record<Mark, string> = { b: "굵게", i: "기울임", u: "밑줄" };
const CMD: Record<Mark, string> = { b: "bold", i: "italic", u: "underline" };
const BTN_STYLE: CSSProperties = { fontWeight: 600 };

export function InlineEditor({
  value,
  onChange,
  className,
  placeholder,
  marks = ["b", "i", "u"],
}: InlineEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 외부 value가 바뀌고 편집 포커스가 없을 때만 DOM 재동기화
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    const next = taggedToHtml(value);
    if (node.innerHTML !== next) node.innerHTML = next;
  }, [value]);

  const apply = (m: Mark) => {
    try {
      document.execCommand("styleWithCSS", false, "false");
    } catch {
      /* noop */
    }
    document.execCommand(CMD[m]);
    if (ref.current) onChange(domToTagged(ref.current));
  };

  const handleInput = () => {
    if (ref.current) onChange(domToTagged(ref.current));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className={className}>
      <div role="toolbar" style={{ display: "flex", gap: 4 }}>
        {marks.map((m) => (
          <button
            key={m}
            type="button"
            data-mark={m}
            style={BTN_STYLE}
            aria-label={LABEL[m]}
            onMouseDown={(e) => {
              e.preventDefault();
              apply(m);
            }}
          >
            {LABEL[m]}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: taggedToHtml(value) }}
      />
    </div>
  );
}
