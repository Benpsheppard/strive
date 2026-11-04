// spRules.js
// Rules that stop Strive Points being farmed with junk workouts

// A workout must be at least this big to earn SP, record PBs or progress quests
const MIN_SETS_FOR_SP = 3
const MIN_DURATION_MINUTES_FOR_SP = 5

// A PB must beat the previous best by at least this fraction...
const MIN_PB_INCREASE_RATIO = 0.01
// ...and, for weights, by at least the smallest plate step (kg)
const MIN_WEIGHT_PB_INCREASE = 0.5

// Max first-lift rewards paid in one workout
const MAX_FIRST_LIFTS_REWARDED = 5

// Max SP a user can earn in one calendar day
const DAILY_SP_CAP = 1500

const NO_SP_REASON = `Log at least ${MIN_SETS_FOR_SP} sets over ${MIN_DURATION_MINUTES_FOR_SP} minutes to earn Strive Points.`

// Does this workout count towards SP, PBs and quests?
const isWorkoutEligibleForSP = (totalSets, durationMinutes) =>
    totalSets >= MIN_SETS_FOR_SP && (Number(durationMinutes) || 0) >= MIN_DURATION_MINUTES_FOR_SP

// Smallest improvement over `previousValue` that counts as a new PB
const getMinPBIncrease = (metric, previousValue) => {
    const proportional = previousValue * MIN_PB_INCREASE_RATIO
    return metric === 'max_weight' ? Math.max(proportional, MIN_WEIGHT_PB_INCREASE) : proportional
}

// Start of the calendar day (server time) containing `date`
const getStartOfDay = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

// SP still available today given what the user has already earned today
const getRemainingDailySP = (earnedToday) => Math.max(0, DAILY_SP_CAP - earnedToday)

module.exports = {
    MIN_SETS_FOR_SP,
    MIN_DURATION_MINUTES_FOR_SP,
    MAX_FIRST_LIFTS_REWARDED,
    DAILY_SP_CAP,
    NO_SP_REASON,
    isWorkoutEligibleForSP,
    getMinPBIncrease,
    getStartOfDay,
    getRemainingDailySP
}
