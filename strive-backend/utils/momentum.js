// momentum.js

const MAX_DAILY_GAIN = 30
const WORKOUT_COMPLETED_MOMENTUM = 5
const PERSONAL_BEST_MOMENTUM = 5
const QUEST_MOMENTUM = {
    daily: 3,
    weekly: 7,
    monthly: 10
}
/**
 * Decay:
 * 0-20: 1 per day
 * 21-40: 2 per day
 * 41-60: 3 per day
 * 61-80: 4 per day
 * 81-100: 5 per day 
 */

const getDaysSince = (date) => {
    if (!date) {
        return 0
    }

    const now = new Date()
    const past = date

    now.setHours(0, 0, 0, 0)
    past.setHours(0, 0, 0, 0)
    
    const diffTime = now - past

    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export const calculateMomentum = (user, data) => {
    let momentum = user.momentum.current
    let earnedMomentum = 0
    console.log(`User current Momentum: ${momentum}`)

    // Momentum Lost
    const daysMissed = getDaysSince(user.momentum.lastCalculated)
    console.log(`Days Missed: ${daysMissed}`)
    
    for (let i = 0; i < daysMissed; i++) {
        const decay = Math.ceil(momentum / 20)
        momentum -= decay
        
        if (momentum <= 0) {
            momentum = 0
            break
        }
    }

    console.log(`Momentum after decay: ${momentum}`)

    // Momentum gained
    if (data.workoutCompleted) {
        earnedMomentum += WORKOUT_COMPLETED_MOMENTUM
    }

    if (data.personalBests) {
        earnedMomentum += data.personalBests * PERSONAL_BEST_MOMENTUM
    }

    if (data.quests) {
        data.quests.forEach(q => {
            earnedMomentum += QUEST_MOMENTUM[q.duration]
        })
    }
    
    console.log(`Earned Momentum: ${earnedMomentum}`)

    momentum += Math.min(MAX_DAILY_GAIN, earnedMomentum)
    console.log(`Momentum after increase: ${momentum}`)

    return Math.max(0, Math.min(100, momentum))
}