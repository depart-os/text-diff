import { useEffect, useRef, type CSSProperties } from "react";
import { domToTagged } from "./dom/domToTagged";
import { taggedToHtml } from "./dom/taggedToHtml";
import type { Mark } from "./types";

export interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** 툴바 컨테이너 div에 적용할 클래스. 지정 시 기본 인라인 스타일 대신 사용 */
  toolbarClassName?: string;
  /** 툴바 버튼에 적용할 클래스. 지정 시 기본 인라인 스타일 대신 사용 */
  buttonClassName?: string;
  /** contentEditable 편집 영역에 적용할 클래스 */
  editorClassName?: string;
  placeholder?: string;
  marks?: Mark[];
}

const LABEL: Record<Mark, string> = { b: "굵게", i: "기울임", u: "밑줄" };
const GLYPH: Record<Mark, string> = { b: "B", i: "I", u: "U" };
const GLYPH_STYLE: Record<Mark, CSSProperties> = {
  b: { fontWeight: 700 },
  i: { fontStyle: "italic" },
  u: { textDecoration: "underline" },
};
const CMD: Record<Mark, string> = { b: "bold", i: "italic", u: "underline" };
const DEFAULT_TOOLBAR_STYLE: CSSProperties = { display: "flex", gap: 4 };

export function InlineEditor({
  value,
  onChange,
  className,
  toolbarClassName,
  buttonClassName,
  editorClassName,
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
      <div
        role="toolbar"
        className={toolbarClassName}
        style={toolbarClassName ? undefined : DEFAULT_TOOLBAR_STYLE}
      >
        {marks.map((m) => (
          <button
            key={m}
            type="button"
            data-mark={m}
            className={buttonClassName}
            aria-label={LABEL[m]}
            title={LABEL[m]}
            onMouseDown={(e) => {
              e.preventDefault();
              apply(m);
            }}
          >
            <span style={GLYPH_STYLE[m]}>{GLYPH[m]}</span>
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={editorClassName}
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: taggedToHtml(value) }}
      />
    </div>
  );
}
