// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { InlineEditor } from "../src/InlineEditor";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let container: HTMLDivElement;
let root: Root;

/** jsdom은 execCommand를 구현하지 않는다. 실제 브라우저처럼 DOM을 바꾸고
 *  네이티브 input 이벤트를 쏘는 동작을 흉내낸다. */
function mockExecCommand(editable: Element) {
  return vi.fn((cmd: string) => {
    if (cmd === "styleWithCSS") return true;
    // 실제 브라우저: execCommand가 DOM을 변경하고 input 이벤트를 발생시킨다
    editable.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  });
}

function nextFrame() {
  return act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
}

function mount(ui: React.ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return container.querySelector("[contenteditable]")!;
}

beforeEach(() => {
  document.queryCommandState = vi.fn(() => false);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("InlineEditor — 서식 적용 시 onChange 중복 호출", () => {
  it("영역 선택 후 굵게 1회 클릭에 onChange를 정확히 1번만 호출한다", () => {
    const onChange = vi.fn();
    const editable = mount(<InlineEditor value="안녕하세요" onChange={onChange} />);

    editable.textContent = "안녕하세요";
    const exec = mockExecCommand(editable);
    document.execCommand = exec;

    // 드래그로 영역을 선택한 상태를 만든다 (hadRange = true 경로)
    const range = document.createRange();
    range.selectNodeContents(editable);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    expect(sel.isCollapsed).toBe(false);

    onChange.mockClear();

    const boldBtn = container.querySelector('[data-mark="b"]')!;
    act(() => {
      boldBtn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    // execCommand는 여러 번 실행되지만(서식 적용 + 토글 해제) onChange는 1번
    expect(exec.mock.calls.filter(([c]) => c === "bold").length).toBeGreaterThan(0);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("execCommand가 발생시킨 input 이벤트는 추가 onChange를 만들지 않는다", () => {
    const onChange = vi.fn();
    const editable = mount(<InlineEditor value="" onChange={onChange} />);
    const exec = mockExecCommand(editable);
    document.execCommand = exec;
    onChange.mockClear();

    const italicBtn = container.querySelector('[data-mark="i"]')!;
    act(() => {
      italicBtn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("사용자 타이핑(input)은 정상적으로 onChange를 호출한다", () => {
    const onChange = vi.fn();
    const editable = mount(<InlineEditor value="" onChange={onChange} />);
    onChange.mockClear();

    act(() => {
      editable.textContent = "가";
      editable.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("가");
  });
});

describe("InlineEditor — selectionchange 리렌더", () => {
  it("서식 상태가 그대로면 selectionchange가 리렌더를 유발하지 않는다", async () => {
    let renders = 0;
    function Counted() {
      renders++;
      return <InlineEditor value="드래그 테스트" onChange={vi.fn()} />;
    }
    mount(<Counted />);
    await nextFrame();

    const baseline = renders;

    // 드래그 한 번에 발생하는 selectionchange 폭격을 흉내
    for (let i = 0; i < 50; i++) {
      document.dispatchEvent(new Event("selectionchange"));
    }
    await nextFrame();
    await nextFrame();

    expect(renders).toBe(baseline);
  });

  it("selectionchange 50회가 프레임당 1회로 합쳐진다", async () => {
    const queryState = vi.fn(() => false);
    document.queryCommandState = queryState;

    const editable = mount(<InlineEditor value="테스트" onChange={vi.fn()} />);
    (editable as HTMLElement).focus();
    await nextFrame();

    queryState.mockClear();

    for (let i = 0; i < 50; i++) {
      document.dispatchEvent(new Event("selectionchange"));
    }
    await nextFrame();

    // 합치지 않으면 50회 × 3마크 = 150번 호출된다. 합치면 3번.
    expect(queryState.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it("서식 상태가 실제로 바뀌면 툴바에 반영된다", async () => {
    const editable = mount(<InlineEditor value="테스트" onChange={vi.fn()} />);
    (editable as HTMLElement).focus();
    await nextFrame();

    const boldBtn = container.querySelector('[data-mark="b"]')!;
    expect(boldBtn.getAttribute("aria-pressed")).toBe("false");

    // 커서가 굵은 글씨 안으로 들어간 상황
    document.queryCommandState = vi.fn((cmd: string) => cmd === "bold");
    document.dispatchEvent(new Event("selectionchange"));
    await nextFrame();

    expect(boldBtn.getAttribute("aria-pressed")).toBe("true");
  });
});
