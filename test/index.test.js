import { inspect } from 'node:util'
import { expect } from '@jest/globals'

import { diff, hasDiff, isDiff } from '..'

describe('diff', () => {
  describe('primitive', () => {
    test('string', () => {
      expect(diff('a', 'a')).toStrictEqual('a')

      const _diff1 = diff('a', 'b')
      expect(isDiff(_diff1)).toBe(true)
      expect(hasDiff(_diff1)).toBe(false)
      expect(_diff1).toStrictEqual(['a', 'b'])
    })

    test('number', () => {
      expect(diff(1, 1)).toStrictEqual(1)

      const _diff1 = diff(1, 2)
      expect(isDiff(_diff1)).toBe(true)
      expect(hasDiff(_diff1)).toBe(false)
      expect(_diff1).toStrictEqual([1, 2])
    })

    test('boolean', () => {
      expect(diff(true, true)).toStrictEqual(true)

      const _diff1 = diff(true, false)
      expect(isDiff(_diff1)).toBe(true)
      expect(hasDiff(_diff1)).toBe(false)
      expect(_diff1).toStrictEqual([true, false])
    })
  })

  describe('array', () => {
    test('same', () => {
      const _diff = diff([1], [1])
      expect(isDiff(_diff)).toBe(false)
      expect(_diff).toStrictEqual([1])
    })

    test('against primitive', () => {
      const _diff = diff([1], 2)
      expect(isDiff(_diff)).toBe(true)
      expect(hasDiff(_diff)).toBe(false)
      expect(isDiff(_diff[0])).toBe(false)
      expect(_diff).toStrictEqual([[1], 2])
    })

    test('same size, different elements', () => {
      const _diff = diff([1], [2])
      expect(isDiff(_diff)).toBe(false)
      expect(hasDiff(_diff)).toBe(true)
      expect(isDiff(_diff[0])).toBe(true)
      expect(hasDiff(_diff[0])).toBe(false)
      expect(_diff).toStrictEqual([[1, 2]])
    })

    test('different size', () => {
      const _diff = diff([1], [1, 2])
      expect(isDiff(_diff)).toBe(true)
      expect(hasDiff(_diff)).toBe(false)
      expect(isDiff(_diff[0])).toBe(false)
      expect(_diff).toStrictEqual([[1], [1, 2]])
    })
  })

  describe('object', () => {
    test('same', () => {
      expect(diff({ a: 1 }, { a: 1 })).toStrictEqual({ a: 1 })
    })

    test('against undefined', () => {
      const _diff = diff({ a: 1 }, undefined)
      expect(isDiff(_diff)).toBe(true)
      expect(hasDiff(_diff)).toBe(false)
      expect(_diff).toStrictEqual([{ a: 1 }, undefined])
    })

    test('against primitive', () => {
      const _diff = diff({ a: 1 }, 2)
      expect(isDiff(_diff)).toBe(true)
      expect(hasDiff(_diff)).toBe(false)
      expect(_diff).toStrictEqual([{ a: 1 }, 2])
    })

    test('same properties, different values', () => {
      const _diff = diff({ a: 1 }, { a: 2 })
      expect(isDiff(_diff)).toBe(false)
      expect(hasDiff(_diff)).toBe(true)
      expect(isDiff(_diff.a)).toBe(true)
      expect(hasDiff(_diff.a)).toBe(false)
      expect(_diff).toStrictEqual({ a: [1, 2] })
    })

    test('different properties', () => {
      const _diff = diff({ a: 1 }, { b: 1 })
      expect(isDiff(_diff)).toBe(false)
      expect(hasDiff(_diff)).toBe(true)
      expect(isDiff(_diff.a)).toBe(true)
      expect(isDiff(_diff.b)).toBe(true)

      expect(_diff).toStrictEqual({ a: [1, undefined], b: [undefined, 1] })
    })
  })

  test('semi production data', () => {
    const old = {
      exchange1: {
        instrument1: {
          currency: 'USD',
          margin: '1000'
        }
      },
      exchange3: {
        instrument3: {
          currency: 'USD',
          margin: '1000'
        }
      },
      exchange4: {
        instrument4: {
          currency: 'USD',
          margin: '1000'
        }
      },
      exchange5: {
        instrument51: {
          currency: 'USD',
          margin: '1000'
        }
      }
    }

    const _new = {
      exchange2: {
        instrument2: {
          currency: 'USD',
          margin: '1000'
        }
      },
      exchange3: {
        instrument3: {
          currency: 'USD',
          margin: '1000'
        }
      },
      exchange4: {
        instrument4: {
          currency: 'USD',
          margin: '2000'
        }
      },
      exchange5: {
        instrument52: {
          currency: 'USD',
          margin: '1000'
        }
      }
    }

    const _diff = diff(old, _new)
    expect(isDiff(_diff)).toBe(false)
    expect(hasDiff(_diff)).toBe(true)

    const exchange1Diff = _diff.exchange1
    expect(isDiff(exchange1Diff)).toBe(true)
    expect(hasDiff(exchange1Diff)).toBe(false)
    expect(exchange1Diff[0]).toStrictEqual(old.exchange1)
    expect(exchange1Diff[1]).toStrictEqual(undefined)

    const exchange2Diff = _diff.exchange2
    expect(isDiff(exchange2Diff)).toBe(true)
    expect(hasDiff(exchange2Diff)).toBe(false)
    expect(exchange2Diff[0]).toStrictEqual(undefined)
    expect(exchange2Diff[1]).toStrictEqual(_new.exchange2)

    const exchange3Diff = _diff.exchange3
    expect(isDiff(exchange3Diff)).toBe(false)
    expect(hasDiff(exchange3Diff)).toBe(false)
    expect(exchange3Diff).toStrictEqual(old.exchange3)
    expect(exchange3Diff).toStrictEqual(_new.exchange3)

    const exchange4Diff = _diff.exchange4
    expect(isDiff(exchange4Diff)).toBe(false)
    expect(hasDiff(exchange4Diff)).toBe(true)
    const instrument4Diff = exchange4Diff.instrument4
    expect(isDiff(instrument4Diff)).toBe(false)
    expect(hasDiff(instrument4Diff)).toBe(true)
    const marginDiff = instrument4Diff.margin
    expect(isDiff(marginDiff)).toBe(true)
    expect(hasDiff(marginDiff)).toBe(false)
    expect(marginDiff[0]).toStrictEqual('1000')
    expect(marginDiff[1]).toStrictEqual('2000')

    const exchange5Diff = _diff.exchange5
    expect(isDiff(exchange5Diff)).toBe(false)
    expect(hasDiff(exchange5Diff)).toBe(true)
    const instrument51Diff = exchange5Diff.instrument51
    expect(isDiff(instrument51Diff)).toBe(true)
    expect(hasDiff(instrument51Diff)).toBe(false)
    expect(instrument51Diff[0]).toStrictEqual(old.exchange5.instrument51)
    expect(instrument51Diff[1]).toStrictEqual(undefined)
    const instrument52Diff = exchange5Diff.instrument52
    expect(isDiff(instrument52Diff)).toBe(true)
    expect(hasDiff(instrument52Diff)).toBe(false)
    expect(instrument52Diff[0]).toStrictEqual(undefined)
    expect(instrument52Diff[1]).toStrictEqual(_new.exchange5.instrument52)
  })

  describe('inspect', () => {
    test('simple', () => {
      expect(inspect(diff({ a: 1 }, undefined))).toBe(
        '$isDiff[ { a: 1 }, undefined ]'
      )
    })
  })
})
