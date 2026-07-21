import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
  /** 커서 위치의 서식이 켜져 있을 때 버튼에 추가되는 클래스 */
  activeButtonClassName?: string;
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
const DEFAULT_ACTIVE_STYLE: CSSProperties = { background: "#e4e4e7" };
const NO_ACTIVE: Record<Mark, boolean> = { b: false, i: false, u: false };

export function InlineEditor({
  value,
  onChange,
  className,
  toolbarClassName,
  buttonClassName,
  activeButtonClassName,
  editorClassName,
  placeholder,
  marks = ["b", "i", "u"],
}: InlineEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const [active, setActive] = useState<Record<Mark, boolean>>(NO_ACTIVE);

  // 초기 마운트 및 외부 value 변경 시에만 DOM 동기화.
  // 편집(포커스) 중에는 DOM이 소스 오브 트루스 — React가 innerHTML을
  // 다시 쓰면 IME 조합과 선택 영역이 깨지므로 절대 건드리지 않는다.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    const next = taggedToHtml(value);
    if (node.innerHTML !== next) node.innerHTML = next;
  }, [value]);

  // 커서/선택 위치의 서식 켜짐 상태를 툴바에 반영
  const syncActive = useCallback(() => {
    const node = ref.current;
    if (!node || document.activeElement !== node) {
      setActive(NO_ACTIVE);
      return;
    }
    try {
      setActive({
        b: document.queryCommandState(CMD.b),
        i: document.queryCommandState(CMD.i),
        u: document.queryCommandState(CMD.u),
      });
    } catch {
      setActive(NO_ACTIVE);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", syncActive);
    return () => document.removeEventListener("selectionchange", syncActive);
  }, [syncActive]);

  const apply = (m: Mark) => {
    try {
      document.execCommand("styleWithCSS", false, "false");
    } catch {
      /* noop */
    }
    const sel = window.getSelection();
    const hadRange = !!sel && !sel.isCollapsed;
    document.execCommand(CMD[m]);
    // 영역 선택에 서식을 적용한 경우: 커서를 영역 끝으로 옮기고 서식을 꺼서
    // 이어지는 타이핑이 서식 없이 입력되게 한다. (커서만 둔 토글은 기존 유지)
    if (hadRange && sel) {
      sel.collapseToEnd();
      if (document.queryCommandState(CMD[m])) {
        document.execCommand(CMD[m]);
      }
    }
    if (ref.current) onChange(domToTagged(ref.current));
    syncActive();
  };

  const handleInput = () => {
    // 한글 등 IME 조합 중에는 onChange를 보류 — 조합 완료 시 반영
    if (composingRef.current) return;
    if (ref.current) onChange(domToTagged(ref.current));
    syncActive();
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = () => {
    composingRef.current = false;
    if (ref.current) onChange(domToTagged(ref.current));
    syncActive();
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
        {marks.map((m) => {
          const isOn = active[m];
          const cls = isOn
            ? [buttonClassName, activeButtonClassName]
                .filter(Boolean)
                .join(" ") || undefined
            : buttonClassName;
          return (
            <button
              key={m}
              type="button"
              data-mark={m}
              data-active={isOn || undefined}
              aria-pressed={isOn}
              className={cls}
              style={
                isOn && !activeButtonClassName
                  ? DEFAULT_ACTIVE_STYLE
                  : undefined
              }
              aria-label={LABEL[m]}
              title={LABEL[m]}
              onMouseDown={(e) => {
                e.preventDefault();
                apply(m);
              }}
            >
              <span style={GLYPH_STYLE[m]}>{GLYPH[m]}</span>
            </button>
          );
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={editorClassName}
        data-placeholder={placeholder}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={syncActive}
        onPaste={handlePaste}
      />
    </div>
  );
}
