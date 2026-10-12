import { expect, test } from 'claude-code/testing'

import { cleanSummary, clip, firstWords } from './summary'

test('firstWords keeps ten words and marks the cut', () => {
  expect(firstWords('one two three')).toBe('one two three')
  expect(firstWords('1 2 3 4 5 6 7 8 9 10 11')).toBe('1 2 3 4 5 6 7 8 9 10…')
  expect(firstWords('# Heading **bold**')).toBe('Heading bold')
})

test('cleanSummary strips quotes and rejects a ramble', () => {
  expect(cleanSummary('"Plan for the migration."')).toBe('Plan for the migration')
  expect(cleanSummary('a b c d e f g h i j k l m n o')).toBe('')
  expect(cleanSummary('a b c d e f g h i j k')).toBe('a b c d e f g h i j…')
})

test('clip caps the lines', () => {
  const text = Array.from({ length: 20 }, (_, i) => `l${i}`).join('\n')
  expect(clip(text).split('\n')).toHaveLength(13)
  expect(clip('short')).toBe('short')
})
