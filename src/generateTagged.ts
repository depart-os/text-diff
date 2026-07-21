import { parseFormatted } from "./parseFormatted";
import { markedDiff } from "./markedDiff";
import { serializeMarked } from "./serializeMarked";

export function generateTagged(before: string, after: string): string {
  return serializeMarked(
    markedDiff(parseFormatted(before), parseFormatted(after)),
  );
}
