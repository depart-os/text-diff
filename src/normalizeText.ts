/**
 * 특수 줄 구분자·특수 공백 정규화.
 *
 * 외부 문서에서 붙여넣은 캡션에 U+2028(LINE SEPARATOR)·U+2029(PARAGRAPH
 * SEPARATOR)·NBSP가 섞여 들어와 Instagram 게시 시 �로 깨지는 문제의 공통 해결
 * 지점. 두 함수로 나뉜 이유:
 *
 * - normalizeTagged: diff·서식 태그가 포함된 저장 문자열용. 문자 치환은 태그
 *   구조에 안전하고, U+2028+LF 중복 쌍 제거는 태그가 사이에 끼어도 동작해야
 *   toPlainText(해소 후 정규화) 결과와 뷰어 표시가 일치한다. 줄 끝 공백
 *   제거는 diff 태그 내부 텍스트를 변형하므로 하지 않는다.
 * - normalizePlain: diff 해소가 끝난 평문용(클립보드·업로드·붙여넣기).
 *   줄 끝 공백 제거까지 수행한다.
 */

// 저장 포맷에서 사용자 텍스트의 <>는 &lt;/&gt;로 이스케이프되므로
// 원시 <...>는 반드시 실제 태그다. 태그를 건너뛰고 중복 쌍을 잡는다.
const TAG_RUN = "(?:<[^>]*>)*";
const SEP_LF_PAIR_TAGGED = new RegExp(
  `[\\u2028\\u2029](?=${TAG_RUN}\\n)|\\n(?=${TAG_RUN}[\\u2028\\u2029])`,
  "g",
);
const SEP_LF_PAIR = /[\u2028\u2029](?=\n)|\n(?=[\u2028\u2029])/g;

export function normalizeTagged(content: string): string {
  return content
    .replace(/\r\n?/g, "\n")
    .replace(SEP_LF_PAIR_TAGGED, "")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/\u00a0/g, " ");
}

export function normalizePlain(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(SEP_LF_PAIR, "")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n");
}
