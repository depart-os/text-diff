import { parseTagged } from './tags'

export function extractBefore(content: string): string {
  return parseTagged(content)
    .filter((p) => p.type !== 'add')
    .map((p) => p.text)
    .join('')
}

export function extractAfter(content: string): string {
  return parseTagged(content)
    .filter((p) => p.type !== 'del')
    .map((p) => p.text)
    .join('')
}
