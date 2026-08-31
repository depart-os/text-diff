import { describe, expect, it } from "vitest";
import { toPlainText } from "../src/toPlainText";

describe("toPlainText", () => {
  it("plain text passes through", () => {
    expect(toPlainText("안녕 세상")).toBe("안녕 세상");
  });
  it("strips formatting tags, keeps text", () => {
    expect(toPlainText("전달 <strong>반드시</strong> 오늘")).toBe(
      "전달 반드시 오늘",
    );
    expect(toPlainText("<strong><em>x</em></strong> <u>y</u>")).toBe("x y");
  });
  it("resolves diff to after view then strips formatting", () => {
    expect(
      toPlainText(
        "<del>오늘까지</del><ins><strong>내일까지</strong></ins> 전달",
      ),
    ).toBe("내일까지 전달");
  });
  it("decodes escaped entities", () => {
    expect(toPlainText("5 &lt; 10 &amp;&amp; x &gt; 3")).toBe(
      "5 < 10 && x > 3",
    );
  });
});

describe("특수 줄바꿈 정규화", () => {
  it("운영 621 회귀: U+2028을 LF로 정규화한다", () => {
    const input =
      "한 사람의 공간에는\u2028선택해온 것들이 하나둘 쌓입니다.\n\n" +
      "하나의 물건,\u2028하나의 장면이 모여\u2028그 사람만의 고유한 결을 만듭니다.";
    expect(toPlainText(input)).toBe(
      "한 사람의 공간에는\n선택해온 것들이 하나둘 쌓입니다.\n\n" +
        "하나의 물건,\n하나의 장면이 모여\n그 사람만의 고유한 결을 만듭니다.",
    );
  });
  it("U+2028+LF 중복 쌍을 LF 하나로 합친다", () => {
    expect(toPlainText("하나,\u2028\n둘")).toBe("하나,\n둘");
  });
  it("NBSP를 일반 공백으로 바꾸고 줄 끝 공백을 제거한다", () => {
    expect(toPlainText("취향이\u00a0\n남는 곳")).toBe("취향이\n남는 곳");
  });
  it("diff 태그 경계에 걸친 중복 쌍도 LF 하나가 된다", () => {
    expect(toPlainText("abc\u2028<ins>\n추가</ins>")).toBe("abc\n추가");
  });
});

describe('draft(temp) 태그', () => {
  it('draft 변경은 평문 추출에서 미적용으로 해소된다', () => {
    expect(
      toPlainText('안녕<tmp-del>하세요</tmp-del><tmp-ins>하십니까</tmp-ins>'),
    ).toBe('안녕하세요')
  })
})
