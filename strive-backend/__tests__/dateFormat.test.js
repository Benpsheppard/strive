const {
    getStartOfWeek,
    getEndOfWeek,
    getPreviousWeekRange,
    getISOWeekString,
    getPreviousISOWeekString,
    getWeeksBetween,
    isoWeekToDate
} = require('../utils/dateFormat')

describe('dateFormat', () => {
    // Wednesday 4 November 2026
    const wednesday = new Date(2026, 10, 4, 15, 30)

    test('weeks start on Monday at midnight', () => {
        const start = getStartOfWeek(wednesday)
        expect(start.getDay()).toBe(1)
        expect(start.getDate()).toBe(2)
        expect(start.getHours()).toBe(0)
    })

    test('a Sunday belongs to the week that started the previous Monday', () => {
        const start = getStartOfWeek(new Date(2026, 10, 8, 12))
        expect(start.getDate()).toBe(2)
    })

    test('weeks end on Sunday at 23:59:59.999', () => {
        const end = getEndOfWeek(wednesday)
        expect(end.getDay()).toBe(0)
        expect(end.getDate()).toBe(8)
        expect(end.getHours()).toBe(23)
        expect(end.getMilliseconds()).toBe(999)
    })

    test('does not change the date passed in', () => {
        const date = new Date(wednesday)
        getStartOfWeek(date)
        getEndOfWeek(date)
        expect(date.getTime()).toBe(wednesday.getTime())
    })

    test('previous week range covers the Monday to Sunday before', () => {
        const { start, end } = getPreviousWeekRange(wednesday)
        expect(start.getDate()).toBe(26)
        expect(start.getMonth()).toBe(9)
        expect(end.getDate()).toBe(1)
        expect(end.getMonth()).toBe(10)
    })

    test('ISO week strings', () => {
        expect(getISOWeekString(wednesday)).toBe('2026-W45')
        expect(getPreviousISOWeekString(wednesday)).toBe('2026-W44')
    })

    test('ISO week string follows ISO year boundaries', () => {
        // 1 Jan 2027 is a Friday in ISO week 53 of 2026
        expect(getISOWeekString(new Date(2027, 0, 1))).toBe('2026-W53')
        // 28 Dec 2026 is a Monday, also in week 53
        expect(getISOWeekString(new Date(2026, 11, 28))).toBe('2026-W53')
    })

    test('weeks between two ISO weeks', () => {
        expect(getWeeksBetween('2026-W40', '2026-W44')).toBe(4)
        expect(getWeeksBetween('2026-W44', '2026-W44')).toBe(0)
        expect(getWeeksBetween('2026-W52', '2027-W02')).toBe(3)
    })

    test('isoWeekToDate returns the Monday of that week', () => {
        const monday = isoWeekToDate('2026-W45')
        expect(monday.getUTCDay()).toBe(1)
        expect(monday.toISOString().slice(0, 10)).toBe('2026-11-02')
    })
})
