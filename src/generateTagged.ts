import { wordDiff } from './diff'
import { serializeToTags } from './tags'

export function generateTagged(before: string, after: string): string {
  return serializeToTags(wordDiff(before, after))
}
