import util from 'node:util'
const $isDiff = Symbol('$isDiff')
const $hasDiff = Symbol('$hasDiff')

export function isDiff(obj) {
  return obj && obj[$isDiff] === true
}

export function hasDiff(obj) {
  return obj && obj[$hasDiff] === true
}

function deepEqualArray(a, b) {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    return deepEqual(a[i], b[i])
  }
}

function deepEqualObject(a, b) {
  const aKeys = Object.keys(a)

  if (!deepEqualArray(aKeys, Object.keys(b))) {
    return false
  }

  for (const key of aKeys) {
    if (!deepEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}

function deepEqual(a, b) {
  if (a === b) {
    return true
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return deepEqualArray(a, b)
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return deepEqualObject(a, b)
  }

  return false
}

function deepDiffArray(a, b) {
  if (a.length !== b.length) {
    return makeDiff([a, b], $isDiff)
  }

  const result = a.map((aa, i) => diff(aa, b[i]))

  if (result.some(r => hasDiff(r) || isDiff(r))) {
    return makeDiff(result, $hasDiff)
  }

  return result
}

function deepDiffObject(a, b) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
  const r = {}
  for (const key of allKeys) {
    r[key] = diff(a[key], b[key])
  }

  if (Object.values(r).some(r => hasDiff(r) || isDiff(r))) {
    r[$hasDiff] = true
  }

  return r
}

export function unmakeDiff(r) {
  delete r[$isDiff]
  delete r[$hasDiff]
  delete r[util.inspect.custom]
  return r
}

function makeDiff(r, symbol) {
  r[symbol] = true
  r[util.inspect.custom] = function (depth, options, inspect) {
    return `$${Symbol.keyFor(symbol)}${inspect(this, {
      ...options,
      customInspect: false
    })}}`
  }
  return r
}

export function diff(a, b) {
  if (deepEqual(a, b)) {
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
