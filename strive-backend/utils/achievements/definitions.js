// definitions.js
// Every achievement in Strive. Definitions live in code (adding one is a code-only change);
// only the ids a user has unlocked are stored, on the user.
//
// A definition looks like:
//   { id, name, description, category, icon, tier, secret?, check(ctx) }
// category is 'achievement' or 'secret'. tier is one of TIERS, ordered by how hard it is to get.
// Ladder achievements are lifetime totals, so they are also flagged `backfill` and can be
// awarded retroactively from a user's history.
// Ladder rungs also carry `ladder: <key>` (rungs of one ladder are listed lowest first) so the
// app can show just the highest rung reached.
// `completion: true` marks the Completionist meta-achievement: it has no check() and is awarded
// by recordUnlocks (evaluate.js) once every other achievement is unlocked.
// check(ctx) is only used for workout-based achievements. Event-based ones (unlocked by the
// app reporting something the user did) have an `event` instead and no check().
//
// ctx (see evaluate.js): { user, workout, summary, exercises, stats, local, previousWorkoutAt, flags }

const { MUSCLE_GROUPS } = require('../../models/exerciseOptions.js')

const CATEGORIES = ['achievement', 'secret']
const TIERS = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'insane']

// Milestone ladders: [threshold, tier] per metric, turned into one achievement per rung
const ladder = ({ key, name, describe, icon, rungs, value }) =>
    rungs.map(([threshold, tier], i) => ({
        id: `${key}_${threshold}`,
        name: `${name} ${['I', 'II', 'III', 'IV', 'V', 'VI'][i]}`,
        description: describe(threshold),
        ladder: key,
        tier,
        icon,
        backfill: true,
        check: (ctx) => value(ctx) >= threshold
    }))

const ladders = [
    ...ladder({
        key: 'workouts', name: 'Workout Warrior', icon: 'dumbbell',
        describe: (n) => n === 1 ? 'Complete your first workout' : `Complete ${n} workouts`,
        rungs: [[1, 'common'], [10, 'uncommon'], [50, 'rare'], [100, 'epic'], [200, 'legendary'], [365, 'insane']],
        value: (ctx) => ctx.stats.workouts
    }),
    ...ladder({
        key: 'level', name: 'Level Up', icon: 'level',
        describe: (n) => `Reach level ${n}`,
        rungs: [[5, 'common'], [10, 'uncommon'], [25, 'rare'], [50, 'epic'], [75, 'legendary'], [100, 'insane']],
        value: (ctx) => ctx.user.level
    }),
    ...ladder({
        key: 'streak', name: 'Streak Keeper', icon: 'flame',
        describe: (n) => `Reach a ${n} week streak`,
        rungs: [[4, 'common'], [6, 'uncommon'], [10, 'rare'], [15, 'epic'], [25, 'legendary'], [52, 'insane']],
        value: (ctx) => Math.max(ctx.user.streak?.best || 0, ctx.user.streak?.current || 0)
    }),
    ...ladder({
        key: 'pbs', name: 'Record Breaker', icon: 'trophy',
        describe: (n) => `Set ${n} personal bests`,
        rungs: [[1, 'common'], [5, 'uncommon'], [10, 'rare'], [50, 'epic'], [100, 'legendary'], [250, 'insane']],
        value: (ctx) => ctx.stats.personalBests
    }),
    ...ladder({
        key: 'volume', name: 'Heavy Lifter', icon: 'weight',
        // Stored in kg; shown in kg here as the unit is a display choice
        describe: (n) => `Lift ${n.toLocaleString('en-GB')}kg in total`,
        rungs: [[10000, 'common'], [50000, 'uncommon'], [100000, 'rare'], [500000, 'epic'], [1000000, 'legendary'], [10000000, 'insane']],
        value: (ctx) => ctx.stats.volume
    }),
    ...ladder({
        key: 'quests', name: 'Quest Master', icon: 'scroll',
        describe: (n) => `Complete ${n} quests`,
        rungs: [[1, 'common'], [10, 'uncommon'], [25, 'rare'], [50, 'epic'], [100, 'legendary'], [250, 'insane']],
        value: (ctx) => ctx.stats.questsCompleted
    })
]

const standalone = [
    // Uncommon Standalone achievements
    {
        id: 'early_bird', name: 'Early Bird', icon: 'sunrise', tier: 'uncommon',
        description: 'Finish a workout before 6am',
        check: ({ local }) => local.hour < 6
    },
    {
        id: 'night_owl', name: 'Night Owl', icon: 'moon', tier: 'uncommon',
        description: 'Finish a workout after 11pm',
        check: ({ local }) => local.hour >= 23
    },
    {
        id: 'leg_day_survivor', name: 'Leg Day Survivor', icon: 'legs', tier: 'uncommon',
        description: 'Do 4 or more leg exercises in one workout',
        check: ({ exercises }) => exercises.filter(e => e.muscleGroup === 'Legs').length >= 4
    },
    {
        id: 'shield_saver', name: 'Shield Saver', icon: 'shield', tier: 'uncommon',
        description: 'Have your streak shield save a streak',
        check: ({ flags }) => Boolean(flags?.shieldUsed)
    },
    // Common Standalone Achievements
    // Rare Standalone Achievements
    {
        id: 'round_number', name: 'Round Number', icon: 'round', tier: 'rare',
        description: 'Lift exactly a multiple of 1,000kg in one workout',
        check: ({ summary }) => summary.totalWeight > 0 && summary.totalWeight % 1000 === 0
    },
    {
        id: 'comeback_kid', name: 'Comeback Kid', icon: 'comeback', tier: 'rare',
        description: 'Return to training after 30 or more days away',
        check: ({ workout, previousWorkoutAt }) =>
            Boolean(previousWorkoutAt) &&
            workout.createdAt - new Date(previousWorkoutAt) >= 30 * 24 * 60 * 60 * 1000
    },
    {
        id: 'new_year', name: 'New Year, New Me', icon: 'party', tier: 'rare',
        description: 'Work out on 1 January',
        check: ({ local }) => local.month === 0 && local.day === 1
    },
    {
        id: 'marathon_session', name: 'Marathon Session', icon: 'clock', tier: 'rare',
        description: 'Train for 2 hours or more in one workout',
        check: ({ workout }) => workout.duration >= 120
    },
    {
        id: 'variety_pack', name: 'Variety Pack', icon: 'variety', tier: 'rare',
        description: 'Train 5 or more different muscle groups in one workout',
        check: ({ exercises }) =>
            new Set(exercises.map(e => e.muscleGroup).filter(g => g && g !== 'Other')).size >= 5
    },
    // Epic Standalone Achievements
    {
        id: 'herculean', name: 'Herculean', icon: 'dumbbell', tier: 'epic',
        description: 'Lift more than 10,000kg in a single workout',
        check: ({ summary }) => summary.totalWeight > 10000
    },
    {
        id: 'lucky_sevens', name: 'Lucky 7s', icon: 'dice', tier: 'epic',
        description: 'Do 7 sets of 7 reps on one exercise',
        check: ({ workout }) => workout.exercises.some(ex =>
            ex.sets.filter(s => s.reps === 7).length >= 7)
    },
    // Legendary Standalone Achievements
    // Insane Standalone Achievements
    {
        // Id kept from when this was a one-rung ladder, so existing unlocks still match
        id: 'equipment_5', name: 'Equipment Explorer', icon: 'toolbox', tier: 'uncommon',
        description: 'Train with 5 different types of equipment',
        // A lifetime total, so it is also awarded retroactively from history
        backfill: true,
        check: ({ stats }) => (stats.equipmentTypes || 0) >= 5
    },
    {
        id: 'completionist', name: "Completionist", icon: 'percentage', tier: 'insane',
        description: 'Complete all achievements, including the secret ones...',
        completion: true
    }
]

// One achievement per real muscle group: complete 10 workouts focused on it. A workout is
// focused on a group when more than half of its exercises belong to that group. These are
// lifetime totals, so they are backfilled from history like the ladders.
const FOCUS_WORKOUTS = 10
const FOCUS_ICONS = {
    Chest: 'dumbbell', Back: 'back', Shoulders: 'shoulders', Arms: 'fist',
    Legs: 'legs', Core: 'core', Cardio: 'heart', 'Full body': 'body'
}
const FOCUS_NAMES = {
    Chest: 'Chest Day Regular', Back: 'Back Day Regular', Shoulders: 'Shoulder Day Regular',
    Arms: 'Arm Day Regular', Legs: 'Leg Day Regular', Core: 'Core Day Regular',
    Cardio: 'Cardio Day Regular', 'Full body': 'Full Body Regular'
}

const focus = MUSCLE_GROUPS.filter(group => FOCUS_ICONS[group]).map(group => ({
    id: `focus_${group.toLowerCase().replace(/\s+/g, '_')}`,
    name: FOCUS_NAMES[group],
    icon: FOCUS_ICONS[group],
    tier: 'uncommon',
    description: `Complete ${FOCUS_WORKOUTS} ${group.toLowerCase()}-focused workouts`,
    backfill: true,
    usesMuscleFocus: true,
    check: (ctx) => (ctx.stats.muscleFocus?.[group] || 0) >= FOCUS_WORKOUTS
}))

const secrets = [
    // Event-based secrets: the app reports a whitelisted event while the user explores
    {
        id: 'theme_switcher', name: 'Mood Lighting', icon: 'palette', tier: 'uncommon',
        description: 'Switch the theme 5 times',
        secret: true, event: 'theme_toggle_5'
    },
    {
        id: 'logo_tapper', name: 'Curious Cat', icon: 'cat', tier: 'uncommon',
        description: 'Tap the logo 10 times',
        secret: true, event: 'logo_tap_10'
    },
    {
        id: 'last_place', name: 'Bottom of the Pile', icon: 'turtle', tier: 'rare',
        description: 'Open the leaderboard in last place',
        secret: true, event: 'leaderboard_last'
    },
    // Secrets
    {
        id: 'palindrome', name: 'Palindrome', icon: 'mirror', tier: 'epic',
        description: 'Finish a workout whose length in minutes reads the same backwards (at least 3 digits, like 101)',
        secret: true,
        check: ({ workout }) => {
            const minutes = String(workout.duration)
            return /^\d{3,}$/.test(minutes) && minutes === [...minutes].reverse().join('')
        }
    },
    {
        id: 'account_birthday', name: 'Happy Strive-versary', icon: 'cake', tier: 'epic',
        description: 'Work out on the anniversary of the day you joined Strive',
        secret: true,
        // At least a year on, so signing up and working out on day one doesn't count
        check: ({ local, accountLocal }) => Boolean(accountLocal) &&
            local.year > accountLocal.year &&
            local.month === accountLocal.month && local.day === accountLocal.day
    },
    {
        id: 'hat_trick', name: 'Hat Trick', icon: 'hat', tier: 'epic',
        description: 'Set 3 personal bests in a single workout',
        secret: true,
        check: ({ summary }) => (summary.personalBests?.length || 0) >= 3
    },
    {
        id: 'triple_double', name: 'Three of a Kind', icon: 'cards', tier: 'epic',
        description: 'Complete 3 quests in a single workout',
        secret: true,
        check: ({ summary }) => (summary.questsCompleted?.length || 0) >= 3
    },
    {
        id: 'leap_day', name: 'Leap Day', icon: 'calendar', tier: 'epic',
        description: 'Train on a leap day (29 February)',
        secret: true,
        // 29 February only exists in leap years, so the date alone is enough
        check: ({ local }) => local.month === 1 && local.day === 29
    },
    {
        id: 'high_noon', name: 'High Noon', icon: 'sun', tier: 'legendary',
        description: 'Finish a workout at exactly 12:00',
        secret: true,
        check: ({ local }) => local.hour === 12 && local.minute === 0
    },
    {
        id: 'speed_run', name: 'Speed Run', icon: 'bolt', tier: 'legendary',
        description: 'Finish a workout in exactly 5 minutes',
        secret: true,
        check: ({ workout }) => workout.duration === 5
    }
]

const ACHIEVEMENTS = [
    ...[...ladders, ...standalone, ...focus].map(a => ({ category: 'achievement', ...a })),
    ...secrets.map(a => ({ category: 'secret', ...a }))
]

// Events the app is allowed to report (derived so the whitelist can't drift from the definitions)
const EVENTS = new Map(ACHIEVEMENTS.filter(a => a.event).map(a => [a.event, a.id]))

const BY_ID = new Map(ACHIEVEMENTS.map(a => [a.id, a]))

// What the API shows for an achievement. Locked secrets are masked so the answer can't be read
// out of the response.
const toPublic = (achievement, unlockedAt = null) => {
    const hidden = achievement.secret && !unlockedAt
    return {
        id: achievement.id,
        category: achievement.category,
        ladder: achievement.ladder || null,
        tier: achievement.tier,
        secret: Boolean(achievement.secret),
        name: hidden ? '???' : achievement.name,
        description: hidden ? 'A secret achievement. Keep exploring.' : achievement.description,
        icon: hidden ? 'lock' : achievement.icon,
        unlockedAt
    }
}

module.exports = { ACHIEVEMENTS, CATEGORIES, TIERS, EVENTS, BY_ID, toPublic }
