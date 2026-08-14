import { parseFormatted } from "./parseFormatted";
import { markedDiff } from "./markedDiff";
import { serializeMarked } from "./serializeMarked";

export interface GenerateTaggedOptions {
  /** true면 임시저장용 tmp-ins/tmp-del 태그로 직렬화한다. */
  draft?: boolean;
}

export function generateTagged(
  before: string,
  after: string,
  options?: GenerateTaggedOptions,
): string {
  return serializeMarked(
    markedDiff(parseFormatted(before), parseFormatted(after)),
    options,
  );
}
