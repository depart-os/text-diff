import { describe, expect, it } from 'vitest'
import { parseTagged, serializeToTags } from '../src/tags'

describe('serializeToTags', () => {
  it('returns empty string for empty parts', () => {
    expect(serializeToTags([])).toBe('')
  })

  it('emits eq parts as raw text', () => {
    expect(serializeToTags([{ type: 'eq', text: 'hello' }])).toBe('hello')
  })

  it('wraps add parts in <ins>', () => {
    expect(serializeToTags([{ type: 'add', text: 'new' }])).toBe(
      '<ins>new</ins>',
    )
  })

  it('wraps del parts in <del>', () => {
    expect(serializeToTags([{ type: 'del', text: 'old' }])).toBe(
      '<del>old</del>',
    )
  })

  it('wraps draft add parts in <tmp-ins>', () => {
    expect(serializeToTags([{ type: 'add', text: 'new', draft: true }])).toBe(
      '<tmp-ins>new</tmp-ins>',
    )
  })

  it('wraps draft del parts in <tmp-del>', () => {
    expect(serializeToTags([{ type: 'del', text: 'old', draft: true }])).toBe(
      '<tmp-del>old</tmp-del>',
    )
  })

  it('serializes a mixed sequence in order', () => {
    expect(
      serializeToTags([
        { type: 'eq', text: '신호' },
        { type: 'del', text: '일 수 있어요' },
        { type: 'add', text: '입니다' },
      ]),
    ).toBe('신호<del>일 수 있어요</del><ins>입니다</ins>')
  })
})

describe('parseTagged', () => {
  it('returns single eq for plain text without tags', () => {
    expect(parseTagged('hello')).toEqual([{ type: 'eq', text: 'hello' }])
  })

  it('returns empty array for empty input', () => {
    expect(parseTagged('')).toEqual([])
  })

  it('parses single <ins> block', () => {
    expect(parseTagged('<ins>new</ins>')).toEqual([
      { type: 'add', text: 'new' },
    ])
  })

  it('parses single <del> block', () => {
    expect(parseTagged('<del>old</del>')).toEqual([
      { type: 'del', text: 'old' },
    ])
  })

  it('parses mixed sequence preserving order', () => {
    expect(
      parseTagged('신호<del>일 수 있어요</del><ins>입니다</ins>'),
    ).toEqual([
      { type: 'eq', text: '신호' },
      { type: 'del', text: '일 수 있어요' },
      { type: 'add', text: '입니다' },
    ])
  })

  it('parses <tmp-ins> block as draft add', () => {
    expect(parseTagged('<tmp-ins>new</tmp-ins>')).toEqual([
      { type: 'add', text: 'new', draft: true },
    ])
  })

  it('parses <tmp-del> block as draft del', () => {
    expect(parseTagged('<tmp-del>old</tmp-del>')).toEqual([
      { type: 'del', text: 'old', draft: true },
    ])
  })

  it('parses mixed final and draft tags preserving order', () => {
    expect(
      parseTagged('신호<del>일 수</del><tmp-ins>있어요</tmp-ins>'),
    ).toEqual([
      { type: 'eq', text: '신호' },
      { type: 'del', text: '일 수' },
      { type: 'add', text: '있어요', draft: true },
    ])
  })

  it('round-trips with serializeToTags', () => {
    const parts = [
      { type: 'eq' as const, text: '안녕 ' },
      { type: 'del' as const, text: '세상' },
      { type: 'add' as const, text: '친구야' },
    ]
    expect(parseTagged(serializeToTags(parts))).toEqual(parts)
  })
})
