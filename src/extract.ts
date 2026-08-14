import { parseTagged, serializeToTags } from './tags'

// draft(tmp-*) 파트는 "아직 제출되지 않은 변경"이므로 before/after 어느 쪽에서도
// 적용하지 않는다. draft를 적용한 결과가 필요하면 extractDraft를 쓴다.
export function extractBefore(content: string): string {
  return parseTagged(content)
    .filter((p) => p.type !== 'add')
    .map((p) => p.text)
    .join('')
}

export function extractAfter(content: string): string {
  return parseTagged(content)
    .filter((p) => (p.draft ? p.type !== 'add' : p.type !== 'del'))
    .map((p) => p.text)
    .join('')
}

/** 확정 diff와 draft를 모두 적용한 결과. 임시저장본을 에디터로 복원할 때 사용. */
export function extractDraft(content: string): string {
  return parseTagged(content)
    .filter((p) => p.type !== 'del')
    .map((p) => p.text)
    .join('')
}

/**
 * draft 파트만 미적용으로 해소해 제거하고(tmp-ins 삭제, tmp-del은 본문으로 복원)
 * 확정 ins/del 태그는 그대로 보존한 저장 문자열을 돌려준다.
 * 임시저장을 비울 때(원복 저장) 사용.
 */
export function stripDraft(content: string): string {
  return serializeToTags(
    parseTagged(content).flatMap((p) => {
      if (!p.draft) return [p]
      if (p.type === 'add') return []
      return [{ type: 'eq' as const, text: p.text }]
    }),
  )
}

/** 임시저장(tmp-ins/tmp-del) 파트 존재 여부. "임시저장됨" 배지 등에 사용. */
export function hasDraft(content: string): boolean {
  return parseTagged(content).some((p) => p.draft === true)
}
