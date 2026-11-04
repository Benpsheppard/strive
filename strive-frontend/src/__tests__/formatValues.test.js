import { describe, test, expect } from 'vitest'
import { formatWeight, parseWeight, lbsToKg, kgToLbs, formatDistance, formatSeconds, formatNumber } from '../utils/formatValues.js'
import { getErrorMessage } from '../utils/getErrorMessage.js'

describe('weight conversion', () => {
    test('formats kilograms and pounds', () => {
        expect(formatWeight(100, false)).toBe('100.0 kg')
        expect(formatWeight(100, true)).toBe('220.5 lbs')
    })

    test('parseWeight converts typed imperial weights back to kg for storage', () => {
        expect(parseWeight('135', true)).toBeCloseTo(61.23, 1)
        expect(parseWeight('60', false)).toBe(60)
    })

    test('a weight typed in lbs displays unchanged after storage', () => {
        const stored = parseWeight('135', true)
        expect(formatWeight(stored, true)).toBe('135.0 lbs')
    })

    test('lbs and kg round trip', () => {
        expect(lbsToKg(kgToLbs(80))).toBeCloseTo(80)
    })
})

describe('other formatters', () => {
    test('distance', () => {
        expect(formatDistance(10, false)).toBe('10.0 km')
        expect(formatDistance(1.609, true)).toBe('1.0 miles')
    })

    test('seconds', () => {
        expect(formatSeconds(45)).toBe('45s')
        expect(formatSeconds(120)).toBe('2m')
        expect(formatSeconds(125)).toBe('2m 5s')
    })

    test('formatNumber handles missing values', () => {
        expect(formatNumber(undefined)).toBe(0)
        expect(formatNumber(1234)).toBe('1,234')
    })
})

describe('getErrorMessage', () => {
    test('prefers the server message', () => {
        expect(getErrorMessage({ response: { data: { message: 'Bad input' } }, message: 'Request failed' })).toBe('Bad input')
    })

    test('falls back to the error message', () => {
        expect(getErrorMessage({ message: 'Network Error' })).toBe('Network Error')
    })
})
