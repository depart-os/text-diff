import type { DiffPart } from './types'

const TAG_RE = /<(del|ins)>([\s\S]*?)<\/\1>/g

export function serializeToTags(parts: DiffPart[]): string {
  let out = ''
  for (const p of parts) {
    if (p.type === 'eq') out += p.text
    else if (p.type === 'add') out += `<ins>${p.text}</ins>`
    else out += `<del>${p.text}</del>`
  }
  return out
}

export function parseTagged(content: string): DiffPart[] {
  if (!content) return []
  const parts: DiffPart[] = []
  let lastIndex = 0
  for (const match of content.matchAll(TAG_RE)) {
    const start = match.index ?? 0
    if (start > lastIndex) {
      parts.push({ type: 'eq', text: content.slice(lastIndex, start) })
    }
    const tag = match[1]
    const inner = match[2]
    parts.push({ type: tag === 'ins' ? 'add' : 'del', text: inner })
    lastIndex = start + match[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'eq', text: content.slice(lastIndex) })
  }
  return parts
}
