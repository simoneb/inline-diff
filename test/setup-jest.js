import { expect } from '@jest/globals'

import { hasDiff, isDiff, unmakeDiff } from '../'

function diffEqualityTester(a, b) {
  if (isDiff(a) || hasDiff(a)) {
    return this.equals(unmakeDiff(a), b, [diffEqualityTester])
  }
  return undefined
}

expect.addEqualityTesters([diffEqualityTester])
