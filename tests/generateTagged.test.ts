import { describe, expect, it } from 'vitest'
import { generateTagged } from '../src/generateTagged'
import { extractAfter, extractBefore, extractDraft, hasDraft } from '../src/extract'

describe('generateTagged', () => {
  it('returns empty string when both inputs are empty', () => {
    expect(generateTagged('', '')).toBe('')
  })

  it('returns plain text when no change', () => {
    expect(generateTagged('hello', 'hello')).toBe('hello')
  })

  it('wraps full content in <ins> when adding from empty', () => {
    expect(generateTagged('', '신규')).toBe('<ins>신규</ins>')
  })

  it('wraps full content in <del> when deleting to empty', () => {
    expect(generateTagged('삭제', '')).toBe('<del>삭제</del>')
  })

  it('produces inline tagged string for single-word replacement', () => {
    expect(
      generateTagged('이것은 좋은 예입니다', '이것은 나쁜 예입니다'),
    ).toBe('이것은 <del>좋은</del><ins>나쁜</ins> 예입니다')
  })

  it('handles Korean word-level diff', () => {
    expect(generateTagged('안녕 세상', '안녕 친구야')).toBe(
      '안녕 <del>세상</del><ins>친구야</ins>',
    )
  })
})

describe('draft 옵션', () => {
  it('draft: true면 tmp 태그로 직렬화되고 after는 원본을 유지한다', () => {
    const tagged = generateTagged('안녕하세요', '안녕하십니까', { draft: true })
    expect(hasDraft(tagged)).toBe(true)
    expect(extractBefore(tagged)).toBe('안녕하세요')
    expect(extractAfter(tagged)).toBe('안녕하세요')
    expect(extractDraft(tagged)).toBe('안녕하십니까')
  })

  it('draft: true는 서식 태그가 있어도 동작한다', () => {
    const tagged = generateTagged(
      '전달 <strong>반드시</strong> 오늘',
      '전달 <strong>꼭</strong> 오늘',
      { draft: true },
    )
    expect(hasDraft(tagged)).toBe(true)
    expect(extractDraft(tagged)).toBe('전달 <strong>꼭</strong> 오늘')
    expect(extractAfter(tagged)).toBe('전달 <strong>반드시</strong> 오늘')
  })

  it('옵션이 없으면 기존과 동일하게 ins/del로 직렬화한다', () => {
    const tagged = generateTagged('안녕하세요', '안녕하십니까')
    expect(hasDraft(tagged)).toBe(false)
    expect(extractAfter(tagged)).toBe('안녕하십니까')
  })
})
