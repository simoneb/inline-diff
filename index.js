import { isDeepStrictEqual } from 'node:util'

import { $hasDiff, $isDiff } from './lib/const'
import { makeDiff } from './lib/util'

export * from './lib/util'

function deepDiffArray(a, b) {
  if (a.length !== b.length) {
    return makeDiff([a, b], $isDiff)
  }

  const result = a.map((ai, i) => diff(ai, b[i]))

  return makeDiff(result, $hasDiff)
}

function deepDiffObject(a, b) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])

  const r = {}

  for (const key of allKeys) {
    r[key] = diff(a[key], b[key])
  }

  return makeDiff(r, $hasDiff)
}

export function diff(a, b) {
  if (isDeepStrictEqual(a, b)) {
    return b
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return deepDiffArray(a, b)
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return deepDiffObject(a, b)
  }

  return makeDiff([a, b], $isDiff)
}
