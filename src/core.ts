// React 의존성이 없는 순수 함수 엔트리. 서버(Nest 등)에서 import할 때 사용한다.
export type {
  DiffPart,
  DiffPartType,
  Mark,
  MarkedToken,
  MarkedPart,
} from "./types";
export {
  generateTagged,
  type GenerateTaggedOptions,
} from "./generateTagged";
export {
  extractBefore,
  extractAfter,
  extractDraft,
  hasDraft,
  stripDraft,
} from "./extract";
export { toPlainText } from "./toPlainText";
export { serializeToTags, parseTagged } from "./tags";
export { taggedToHtml } from "./dom/taggedToHtml";
