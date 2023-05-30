import util from 'node:util'

import { $hasDiff, $isDiff } from './const'

export function unmakeDiff(obj) {
  delete obj[$isDiff]
  delete obj[$hasDiff]
  delete obj[util.inspect.custom]
  return obj
}

export function makeDiff(obj, symbol) {
  Object.defineProperty(obj, symbol, {
    value: true,
    configurable: true
  })

  Object.defineProperty(obj, util.inspect.custom, {
    value(depth, options, inspect) {
      return `${Symbol.keyFor(symbol)}${inspect(this, {
        ...options,
        depth,
        customInspect: false
      })}`
    },
    configurable: true
  })

  return obj
}

export function isDiff(obj) {
  return obj && obj[$isDiff] === true
}

export function hasDiff(obj) {
  return obj && obj[$hasDiff] === true
}
