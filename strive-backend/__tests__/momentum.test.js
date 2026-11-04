const { calculateMomentum } = require('../utils/momentum')

const daysAgo = (days) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
}

const makeUser = (current, lastCalculated = null) => ({ momentum: { current, lastCalculated } })

describe('calculateMomentum', () => {
    test('gains 5 for completing a workout', () => {
        expect(calculateMomentum(makeUser(10), { workoutCompleted: true })).toBe(15)
    })

    test('gains 5 per personal best and quest momentum by duration', () => {
        const data = {
            workoutCompleted: true,
            personalBests: 2,
            quests: [{ duration: 'daily' }, { duration: 'weekly' }, { duration: 'monthly' }]
        }
        // 5 + 10 + 3 + 7 + 10 = 35, capped at 30 per workout
        expect(calculateMomentum(makeUser(0), data)).toBe(30)
    })

    test('an unknown quest duration adds nothing instead of NaN', () => {
        const result = calculateMomentum(makeUser(10), { quests: [{ duration: 'yearly' }] })
        expect(result).toBe(10)
    })

    test('never goes above 100', () => {
        expect(calculateMomentum(makeUser(98), { workoutCompleted: true })).toBe(100)
    })

    test('decays by 1 per day at 20 or below', () => {
        expect(calculateMomentum(makeUser(20, daysAgo(3)), {})).toBe(17)
    })

    test('decays faster at higher momentum', () => {
        // 100 -> 95 after one day (ceil(100 / 20) = 5)
        expect(calculateMomentum(makeUser(100, daysAgo(1)), {})).toBe(95)
    })

    test('decays to zero but not below', () => {
        expect(calculateMomentum(makeUser(10, daysAgo(60)), {})).toBe(0)
    })

    test('does not decay when calculated today', () => {
        expect(calculateMomentum(makeUser(50, new Date()), {})).toBe(50)
    })

    test('does not change the stored lastCalculated date', () => {
        const lastCalculated = daysAgo(2)
        lastCalculated.setHours(15, 30, 0, 0)
        const before = lastCalculated.getTime()

        calculateMomentum(makeUser(50, lastCalculated), {})

        expect(lastCalculated.getTime()).toBe(before)
    })
})
