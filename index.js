import util from 'node:util'
const $diff = Symbol.for['$diff']

export function isDiff(obj) {
  return obj && obj[$diff] === true
}

function deepEqualArray(old, _new) {
  if (old.length !== _new.length) {
    return false
  }

  for (let i = 0; i < old.length; i++) {
    return deepEqual(old[i], _new[i])
  }
}

function deepEqualObject(old, _new) {
  if (!deepEqualArray(Object.keys(old), Object.keys(_new))) {
    return false
  }

  for (const key of Object.keys(old)) {
    if (!deepEqual(old[key], _new[key])) {
      return false
    }
  }
  return true
}

function deepEqual(old, _new) {
  if (Array.isArray(old) && Array.isArray(_new)) {
    return deepEqualArray(old, _new)
  }
  if (typeof old === 'object' && typeof _new === 'object') {
    return deepEqualObject(old, _new)
  }
  return old === _new
}

function deepDiffArray(old, _new) {
  if (old.length !== _new.length) {
    return makeDiff([old, _new])
  }

  return old.map((o, i) => diff(o, _new[i]))
}

function deepDiffObject(old, _new) {
  const allKeys = new Set([...Object.keys(old), ...Object.keys(_new)])
  const r = {}
  for (const key of allKeys) {
    r[key] = diff(old[key], _new[key])
  }
  return r
}

export function unmakeDiff(r) {
  delete r[$diff]
  delete r[util.inspect.custom]
  return r
}

function makeDiff(r) {
  r[$diff] = true
  r[util.inspect.custom] = function (depth, options, inspect) {
    return `$diff${inspect(this, {
      ...options,
      customInspect: false
    })}}`
  }
  return r
}

export function diff(old, _new) {
  if (old === _new || deepEqual(old, _new)) {
    return _new
  }

  if (Array.isArray(old) && Array.isArray(_new)) {
    return deepDiffArray(old, _new)
  }
  if (typeof old === 'object' && typeof _new === 'object') {
    return deepDiffObject(old, _new)
  }

  return makeDiff([old, _new])
}
