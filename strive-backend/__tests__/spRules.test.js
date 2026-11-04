const {
    isWorkoutEligibleForSP,
    getMinPBIncrease,
    getRemainingDailySP,
    DAILY_SP_CAP
} = require('../utils/spRules')

describe('spRules', () => {
    test('eligibility needs enough sets and time', () => {
        expect(isWorkoutEligibleForSP(3, 5)).toBe(true)
        expect(isWorkoutEligibleForSP(2, 60)).toBe(false)
        expect(isWorkoutEligibleForSP(10, 4)).toBe(false)
        expect(isWorkoutEligibleForSP(10, undefined)).toBe(false)
    })

    test('minimum PB increase', () => {
        expect(getMinPBIncrease('max_weight', 200)).toBe(2)
        expect(getMinPBIncrease('max_weight', 20)).toBe(0.5)
        expect(getMinPBIncrease('max_reps', 10)).toBeCloseTo(0.1)
    })

    test('remaining daily SP never goes negative', () => {
        expect(getRemainingDailySP(0)).toBe(DAILY_SP_CAP)
        expect(getRemainingDailySP(DAILY_SP_CAP + 500)).toBe(0)
    })
})
