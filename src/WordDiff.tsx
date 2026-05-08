import { useMemo } from 'react'
import { parseTagged } from './tags'
import type { DiffPart } from './types'

export type WordDiffMode = 'before' | 'after' | 'diff'

export interface WordDiffProps {
  content: string
  mode: WordDiffMode
  className?: string
}

const BASE_CLASS =
  'whitespace-pre-wrap text-[14px] leading-[1.75] text-zinc-800'

const ADD_CLASS = 'rounded-sm bg-blue-100 px-0.5 text-blue-900'
const DEL_CLASS =
  'rounded-sm bg-rose-50 px-0.5 text-rose-500 line-through decoration-rose-400 decoration-1'

function filterByMode(parts: DiffPart[], mode: WordDiffMode): DiffPart[] {
  if (mode === 'before') {
    return parts
      .filter((p) => p.type !== 'add')
      .map((p) => (p.type === 'del' ? { type: 'eq', text: p.text } : p))
  }
  if (mode === 'after') {
    return parts
      .filter((p) => p.type !== 'del')
      .map((p) => (p.type === 'add' ? { type: 'eq', text: p.text } : p))
  }
  return parts
}

export function WordDiff({ content, mode, className }: WordDiffProps) {
  const parts = useMemo(
    () => filterByMode(parseTagged(content), mode),
    [content, mode],
  )
  const finalClass = className ? `${BASE_CLASS} ${className}` : BASE_CLASS
  return (
    <p className={finalClass}>
      {parts.map((p, i) => {
        if (p.type === 'eq') return <span key={i}>{p.text}</span>
        if (p.type === 'add')
          return (
            <mark key={i} className={ADD_CLASS}>
              {p.text}
            </mark>
          )
        return (
          <span key={i} className={DEL_CLASS}>
            {p.text}
          </span>
        )
      })}
    </p>
  )
}
