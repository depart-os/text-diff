import { describe, expect, it } from 'vitest'
import { generateTagged } from '../src/generateTagged'

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
