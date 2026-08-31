import { extractAfter } from "./extract";
import { decodeEntities } from "./escape";
import { normalizePlain } from "./normalizeText";

const FORMAT_TAG = /<\/?(?:strong|b|em|i|u)>/gi;

/**
 * 저장 문자열(diff 태그·서식 태그 포함 가능)에서 순수 평문을 추출한다.
 * 업로드·클립보드 복사 등 태그가 절대 섞이면 안 되는 경로에서 사용.
 * after(최신 시안) 기준으로 diff를 해소하고 서식 태그를 제거한 뒤
 * 이스케이프된 엔티티를 원문 문자로 복원하고, 특수 줄 구분자·NBSP를
 * 표준 LF·일반 공백으로 정규화한다.
 */
export function toPlainText(content: string): string {
  return normalizePlain(
    decodeEntities(extractAfter(content).replace(FORMAT_TAG, "")),
  );
}
