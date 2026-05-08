import { describe, expect, it } from 'vitest'
import { wordDiff } from '../src/diff'

describe('wordDiff (internal)', () => {
  it('returns empty array for two empty strings', () => {
    expect(wordDiff('', '')).toEqual([])
  })

  it('returns single eq part for identical strings', () => {
    expect(wordDiff('hello', 'hello')).toEqual([{ type: 'eq', text: 'hello' }])
  })

  it('treats addition from empty as single add', () => {
    expect(wordDiff('', 'hello')).toEqual([{ type: 'add', text: 'hello' }])
  })

  it('treats deletion to empty as single del', () => {
    expect(wordDiff('hello', '')).toEqual([{ type: 'del', text: 'hello' }])
  })

  it('marks word-level edits with eq/del/add structure', () => {
    expect(wordDiff('hello world', 'hello there')).toEqual([
      { type: 'eq', text: 'hello ' },
      { type: 'del', text: 'world' },
      { type: 'add', text: 'there' },
    ])
  })

  it('tokenizes Korean text by word', () => {
    expect(wordDiff('안녕하세요 반가워요', '안녕하세요 반갑습니다')).toEqual([
      { type: 'eq', text: '안녕하세요 ' },
      { type: 'del', text: '반가워요' },
      { type: 'add', text: '반갑습니다' },
    ])
  })

  it('preserves whitespace as eq tokens', () => {
    const result = wordDiff('a b', 'a b')
    expect(result).toEqual([{ type: 'eq', text: 'a b' }])
  })

  it('merges consecutive parts of the same type into one', () => {
    const result = wordDiff('foo bar baz', 'qux quux baz')
    for (let i = 1; i < result.length; i++) {
      expect(result[i].type).not.toBe(result[i - 1].type)
    }
  })

  it('handles punctuation as separate tokens', () => {
    const result = wordDiff('Hello, world.', 'Hello, mundo.')
    const eqText = result
      .filter((p) => p.type === 'eq')
      .map((p) => p.text)
      .join('')
    expect(eqText).toContain('Hello, ')
    expect(eqText).toContain('.')
  })
})
