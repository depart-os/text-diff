import type { DiffPart } from './types'

const TAG_RE = /<(del|ins|tmp-del|tmp-ins)>([\s\S]*?)<\/\1>/g

export function serializeToTags(parts: DiffPart[]): string {
  let out = ''
  for (const p of parts) {
    if (p.type === 'eq') out += p.text
    else if (p.type === 'add')
      out += p.draft ? `<tmp-ins>${p.text}</tmp-ins>` : `<ins>${p.text}</ins>`
    else
      out += p.draft ? `<tmp-del>${p.text}</tmp-del>` : `<del>${p.text}</del>`
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
    const draft = tag.startsWith('tmp-')
    const type = tag.endsWith('ins') ? ('add' as const) : ('del' as const)
    parts.push(draft ? { type, text: inner, draft } : { type, text: inner })
    lastIndex = start + match[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'eq', text: content.slice(lastIndex) })
  }
  return parts
}
