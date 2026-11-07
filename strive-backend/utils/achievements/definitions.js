// definitions.js
// Every achievement in Strive. Definitions live in code (adding one is a code-only change);
// only the ids a user has unlocked are stored, on the user.
//
// A definition looks like:
//   { id, name, description, category, icon, tier?, secret?, check(ctx) }
// check(ctx) is only used for workout-based achievements. Event-based ones (unlocked by the
// app reporting something the user did) have an `event` instead and no check().
//
// ctx (see evaluate.js): { user, workout, summary, exercises, stats, local, previousWorkoutAt, flags }

const CATEGORIES = ['milestone', 'wacky', 'secret']
const TIERS = ['bronze', 'silver', 'gold']

// Milestone ladders: [threshold, tier] per metric, turned into one achievement per rung
const ladder = ({ key, name, describe, icon, rungs, value }) =>
    rungs.map(([threshold, tier], i) => ({
        id: `${key}_${threshold}`,
        name: `${name} ${['I', 'II', 'III', 'IV', 'V'][i]}`,
        description: describe(threshold),
        category: 'milestone',
        tier,
        icon,
        check: (ctx) => value(ctx) >= threshold
    }))

const milestones = [
    ...ladder({
        key: 'workouts', name: 'Workout Warrior', icon: 'dumbbell',
        describe: (n) => n === 1 ? 'Complete your first workout' : `Complete ${n} workouts`,
        rungs: [[1, 'bronze'], [10, 'bronze'], [50, 'silver'], [100, 'gold'], [250, 'gold']],
        value: (ctx) => ctx.stats.workouts
    }),
    ...ladder({
        key: 'level', name: 'Level Up', icon: 'level',
        describe: (n) => `Reach level ${n}`,
        rungs: [[5, 'bronze'], [10, 'silver'], [25, 'gold']],
        value: (ctx) => ctx.user.level
    }),
    ...ladder({
        key: 'streak', name: 'Streak Keeper', icon: 'flame',
        describe: (n) => `Reach a ${n} week streak`,
        rungs: [[4, 'bronze'], [12, 'silver'], [26, 'gold']],
        value: (ctx) => Math.max(ctx.user.streak?.best || 0, ctx.user.streak?.current || 0)
    }),
    ...ladder({
        key: 'pbs', name: 'Record Breaker', icon: 'trophy',
        describe: (n) => `Set ${n} personal bests`,
        rungs: [[1, 'bronze'], [10, 'silver'], [50, 'gold']],
        value: (ctx) => ctx.stats.personalBests
    }),
    ...ladder({
        key: 'volume', name: 'Heavy Lifter', icon: 'weight',
        // Stored in kg; shown in kg here as the unit is a display choice
        describe: (n) => `Lift ${n.toLocaleString('en-GB')}kg in total`,
        rungs: [[10000, 'bronze'], [100000, 'silver'], [1000000, 'gold']],
        value: (ctx) => ctx.stats.volume
    }),
    ...ladder({
        key: 'quests', name: 'Quest Master', icon: 'scroll',
        describe: (n) => `Complete ${n} quests`,
        rungs: [[1, 'bronze'], [25, 'silver'], [100, 'gold']],
        value: (ctx) => ctx.stats.questsCompleted
    })
]

const wacky = [
    {
        id: 'early_bird', name: 'Early Bird', icon: 'sunrise',
        description: 'Finish a workout before 6am',
        check: ({ local }) => local.hour < 6
    },
    {
        id: 'night_owl', name: 'Night Owl', icon: 'moon',
        description: 'Finish a workout after 11pm',
        check: ({ local }) => local.hour >= 23
    },
    {
        id: 'leg_day_survivor', name: 'Leg Day Survivor', icon: 'legs',
        description: 'Do 4 or more leg exercises in one workout',
        check: ({ exercises }) => exercises.filter(e => e.muscleGroup === 'Legs').length >= 4
    },
    {
        id: 'round_number', name: 'Round Number', icon: 'round',
        description: 'Lift exactly a multiple of 1,000kg in one workout',
        check: ({ summary }) => summary.totalWeight > 0 && summary.totalWeight % 1000 === 0
    },
    {
        id: 'comeback_kid', name: 'Comeback Kid', icon: 'comeback',
        description: 'Return to training after 30 or more days away',
        check: ({ workout, previousWorkoutAt }) =>
            Boolean(previousWorkoutAt) &&
            workout.createdAt - new Date(previousWorkoutAt) >= 30 * 24 * 60 * 60 * 1000
    },
    {
        id: 'shield_saver', name: 'Shield Saver', icon: 'shield',
        description: 'Have your streak shield save a streak',
        check: ({ flags }) => Boolean(flags?.shieldUsed)
    },
    {
        id: 'new_year', name: 'New Year, New Me', icon: 'party',
        description: 'Work out on 1 January',
        check: ({ local }) => local.month === 0 && local.day === 1
    },
    {
        id: 'lucky_sevens', name: 'Lucky 7s', icon: 'dice',
        description: 'Do 7 sets of 7 reps on one exercise',
        check: ({ workout }) => workout.exercises.some(ex =>
            ex.sets.filter(s => s.reps === 7).length >= 7)
    },
    {
        id: 'marathon_session', name: 'Marathon Session', icon: 'clock',
        description: 'Train for 2 hours or more in one workout',
        check: ({ workout }) => workout.duration >= 120
    }
]

const secrets = [
    {
        id: 'hat_trick', name: 'Hat Trick', icon: 'hat',
        description: 'Set 3 personal bests in a single workout',
        secret: true,
        check: ({ summary }) => (summary.personalBests?.length || 0) >= 3
    },
    {
        id: 'high_noon', name: 'High Noon', icon: 'sun',
        description: 'Finish a workout at exactly 12:00',
        secret: true,
        check: ({ local }) => local.hour === 12 && local.minute === 0
    },
    {
        id: 'speed_run', name: 'Speed Run', icon: 'bolt',
        description: 'Finish a workout in exactly 5 minutes',
        secret: true,
        check: ({ workout }) => workout.duration === 5
    },
    {
        id: 'triple_double', name: 'Three of a Kind', icon: 'cards',
        description: 'Complete 3 quests in a single workout',
        secret: true,
        check: ({ summary }) => (summary.questsCompleted?.length || 0) >= 3
    },
    // Event-based secrets: the app reports a whitelisted event while the user explores
    {
        id: 'theme_switcher', name: 'Mood Lighting', icon: 'palette',
        description: 'Switch the theme 5 times',
        secret: true, event: 'theme_toggle_5'
    },
    {
        id: 'logo_tapper', name: 'Curious Cat', icon: 'cat',
        description: 'Tap the logo 10 times',
        secret: true, event: 'logo_tap_10'
    },
    {
        id: 'last_place', name: 'Bottom of the Pile', icon: 'turtle',
        description: 'Open the leaderboard in last place',
        secret: true, event: 'leaderboard_last'
    }
]

const ACHIEVEMENTS = [
    ...milestones,
    ...wacky.map(a => ({ category: 'wacky', ...a })),
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
        tier: achievement.tier || null,
        secret: Boolean(achievement.secret),
        name: hidden ? '???' : achievement.name,
        description: hidden ? 'A secret achievement. Keep exploring.' : achievement.description,
        icon: hidden ? 'lock' : achievement.icon,
        unlockedAt
    }
}

module.exports = { ACHIEVEMENTS, CATEGORIES, TIERS, EVENTS, BY_ID, toPublic }
