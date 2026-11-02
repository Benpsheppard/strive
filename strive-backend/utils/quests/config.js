// config.js
// Quest generation settings

const QUEST_TYPE_DISTRIBUTION = {
    daily: ['strength', 'consistency', 'strength'],
    weekly: ['progressive', 'volume'],
    monthly: ['consistency', 'strength', 'volume', 'progressive']
}

const QUEST_CONFIG = {
    daily: { count: 3, expiryDays: 1, reward: 100 },
    weekly: { count: 2, expiryDays: 7, reward: 500 },
    monthly: { count: 1, expiryDays: 30, reward: 1000 }
}

const PROGRESSIVE_METRICS_BY_TRACKING_MODE = {
    weight_reps: ['max_weight', 'max_reps', 'session_volume'],
    bodyweight_reps: ['max_reps'],
    assisted_reps: ['max_reps'],
    reps: ['max_reps'],
    duration: ['total_duration'],
    distance: ['total_distance'],
    distance_duration: ['total_distance', 'total_duration'],
    distance_weight: ['total_distance'],
    other: []
}

module.exports = {
    QUEST_TYPE_DISTRIBUTION,
    QUEST_CONFIG,
    PROGRESSIVE_METRICS_BY_TRACKING_MODE
}
