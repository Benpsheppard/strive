// momentum.js

const MAX_DAILY_GAIN = 30
const WORKOUT_COMPLETED_MOMENTUM = 5
const PERSONAL_BEST_MOMENTUM = 5
const QUEST_MOMENTUM = {
    daily: 3,
    weekly: 7,
    monthly: 10
}

export const calculateMomentum = (user, data) => {
    let momentum = user.momentum

    if (data.workoutCompleted) {
        momentum += WORKOUT_COMPLETED_MOMENTUM
    }

    if (data.personalBests) {
        momentum += data.personalBests * PERSONAL_BEST_MOMENTUM
    }

    if (data.quests) {
        data.quests.forEach(q => {
            momentum += QUEST_MOMENTUM[q.duration]
        })
    }

    return Math.max(0, Math.min(100, momentum))
}