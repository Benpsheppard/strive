// accountData.js
// Removing and exporting everything that belongs to a user

const Workout = require('../models/workoutModel')
const Quest = require('../models/questModel')
const LeaderboardEntry = require('../models/leaderboardEntryModel')
const Exercise = require('../models/exerciseModel')
const Routine = require('../models/routineModel')

// Deletes a user's data. The user record goes last and every step can be repeated safely,
// so if something fails part-way a retry finishes the job instead of leaving orphans.
const deleteUserData = async (userId) => {
    await Workout.deleteMany({ user: userId })
    await Quest.deleteMany({ user: userId })
    await LeaderboardEntry.deleteMany({ user: userId })
    await Routine.deleteMany({ user: userId })
    await Exercise.deleteMany({ createdBy: userId, isCustom: true })
}

// Everything held about a user, for the "download my data" feature. Never includes the
// password hash or any token.
const collectUserData = async (user) => {
    const [workouts, quests, leaderboardEntries, customExercises, routines] = await Promise.all([
        Workout.find({ user: user._id }).populate('exercises.exercise', 'name muscleGroup trackingMode').lean(),
        Quest.find({ user: user._id }).lean(),
        LeaderboardEntry.find({ user: user._id }).lean(),
        Exercise.find({ createdBy: user._id, isCustom: true }).lean(),
        Routine.find({ user: user._id }).populate('exercises.exercise', 'name').lean()
    ])

    return {
        exportedAt: new Date().toISOString(),
        profile: {
            username: user.username,
            email: user.email,
            emailVerified: Boolean(user.emailVerified),
            createdAt: user.createdAt,
            acceptedTermsAt: user.acceptedTermsAt,
            termsVersion: user.termsVersion,
            level: user.level,
            strivepoints: user.strivepoints,
            streak: user.streak,
            momentum: user.momentum,
            target: user.target,
            height: user.height,
            weight: user.weight,
            useImperial: user.useImperial
        },
        workouts,
        quests,
        leaderboardEntries,
        customExercises,
        routines
    }
}

module.exports = { deleteUserData, collectUserData }
