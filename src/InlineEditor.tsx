import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { domToTagged } from "./dom/domToTagged";
import { taggedToHtml } from "./dom/taggedToHtml";
import { normalizePlain } from "./normalizeText";
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
  /** true면 편집·툴바 비활성화 (내용은 계속 표시) */
  disabled?: boolean;
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

/** jsdom 등 queryCommandState 미구현 환경에서도 안전하게 조회 */
function queryState(m: Mark): boolean {
  try {
    return document.queryCommandState(CMD[m]);
  } catch {
    return false;
  }
}

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
  disabled = false,
}: InlineEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const applyingRef = useRef(false);
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

  // 커서/선택 위치의 서식 켜짐 상태를 툴바에 반영.
  // 값이 그대로면 이전 객체를 그대로 반환해 리렌더를 막는다 —
  // 드래그 중 selectionchange가 초당 수십 번 발생하므로 필수.
  const syncActive = useCallback(() => {
    const node = ref.current;
    const next =
      !node || document.activeElement !== node
        ? NO_ACTIVE
        : { b: queryState("b"), i: queryState("i"), u: queryState("u") };

    setActive((prev) =>
      prev.b === next.b && prev.i === next.i && prev.u === next.u ? prev : next,
    );
  }, []);

  // selectionchange는 드래그 한 번에 수십~수백 번 발생한다.
  // queryCommandState는 스타일 재계산을 유발하므로 프레임당 1회로 합친다.
  useEffect(() => {
    let scheduled = 0;

    const onSelectionChange = () => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => {
        scheduled = 0;
        syncActive();
      });
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      if (scheduled) cancelAnimationFrame(scheduled);
    };
  }, [syncActive]);

  const emitChange = useCallback(() => {
    if (ref.current) onChange(domToTagged(ref.current));
  }, [onChange]);

  const apply = (m: Mark) => {
    // execCommand는 네이티브 input 이벤트를 발생시켜 handleInput을 중복 호출한다.
    // 영역 선택 시 execCommand가 두 번 실행되므로 onChange가 최대 3번 나갔다.
    // 적용 중에는 handleInput을 막고, 끝난 뒤 최종 DOM 상태로 한 번만 보낸다.
    applyingRef.current = true;
    try {
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
        if (queryState(m)) {
          document.execCommand(CMD[m]);
        }
      }
    } finally {
      applyingRef.current = false;
    }
    emitChange();
    syncActive();
  };

  const handleInput = () => {
    // 한글 등 IME 조합 중에는 onChange를 보류 — 조합 완료 시 반영
    if (composingRef.current) return;
    // apply()가 끝난 뒤 한 번만 내보낸다
    if (applyingRef.current) return;
    emitChange();
    syncActive();
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = () => {
    composingRef.current = false;
    emitChange();
    syncActive();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // 외부 문서의 U+2028·U+2029·NBSP가 저장 데이터로 유입되지 않게 차단
    const text = normalizePlain(e.clipboardData.getData("text/plain"));
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
              disabled={disabled}
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
        contentEditable={!disabled}
        suppressContentEditableWarning
        aria-disabled={disabled || undefined}
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
