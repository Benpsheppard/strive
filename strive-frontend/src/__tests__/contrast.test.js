/* global process */
import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// WCAG 2 relative luminance and contrast ratio
const channel = (c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luminance = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}
const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

// Read the tokens straight from the stylesheet so this test can't drift from the real values
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const lightBlock = css.match(/:root\[data-theme='light'\]\s*\{[^}]*\}/)[0]
const darkBlock = css.slice(0, css.indexOf(lightBlock))
const tokenFrom = (block) => (name) => {
    const match = block.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))
    if (!match) throw new Error(`Missing colour token: ${name}`)
    return match[1]
}

describe.each([['dark', darkBlock], ['light', lightBlock]])('%s theme colour contrast (WCAG AA, 4.5:1 for normal text)', (_name, block) => {
    const token = tokenFrom(block)
    const surfaces = ['bg', 'surface', 'surface-2']

    test.each(surfaces)('main text on %s', (surface) => {
        expect(contrast(token('fg'), token(surface))).toBeGreaterThanOrEqual(4.5)
    })

    test.each(surfaces)('muted text on %s', (surface) => {
        expect(contrast(token('muted'), token(surface))).toBeGreaterThanOrEqual(4.5)
    })

    test.each(surfaces)('accent text on %s', (surface) => {
        expect(contrast(token('accent-fg'), token(surface))).toBeGreaterThanOrEqual(4.5)
    })

    test.each(surfaces)('success and warning text on %s', (surface) => {
        expect(contrast(token('success'), token(surface))).toBeGreaterThanOrEqual(4.5)
        expect(contrast(token('warning'), token(surface))).toBeGreaterThanOrEqual(4.5)
    })

    test('white text on primary buttons', () => {
        expect(contrast('#ffffff', token('accent'))).toBeGreaterThanOrEqual(4.5)
        expect(contrast('#ffffff', token('accent-strong'))).toBeGreaterThanOrEqual(4.5)
    })

    test('borders are at least faintly visible against the card surface', () => {
        expect(contrast(token('line'), token('surface'))).toBeGreaterThanOrEqual(1.8)
    })
})
