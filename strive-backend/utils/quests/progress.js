// progress.js
// Works out which quests a workout completes, and saves the result

const Quest = require('../../models/questModel')
const questTypes = require('./types')

// Read-only: works out which quests this workout completes and what progress to
// save for each. Nothing is written until applyQuestResults is called.
const detectQuestCompletion = async (userId, exercises, workout) => {
    // Expired quests are only swept to 'expired' when the user next loads their quests,
    // so filter on expiry here to stop a lapsed quest being progressed or paid out
    const activeQuests = await Quest.find({ user: userId, status: 'active', expiry: { $gt: new Date() } })
    const questsCompleted = []
    const questUpdates = []
    let totalQuestSP = 0

    for (const quest of activeQuests) {
        const questType = questTypes[quest.questType ?? 'strength']
        if (!questType) continue

        const { completed, progress } = await questType.check(quest, exercises, workout)

        if (progress || completed) {
            questUpdates.push({ quest, progress, completed })
        }

        if (completed) {
            questsCompleted.push({
                questId: quest._id,
                title: quest.title,
                reward: quest.reward,
                duration: quest.duration
            })

            totalQuestSP += quest.reward
        }
    }

    return { questsCompleted, totalQuestSP, questUpdates }
}

// Save the quest progress / completions found by detectQuestCompletion
const applyQuestResults = async (questUpdates = []) => {
    for (const { quest, progress, completed } of questUpdates) {
        if (progress) {
            quest.progressLog.push(progress.logEntry)
            for (const [field, value] of Object.entries(progress.completion)) {
                quest.set(`completion.${field}`, value)
            }
        }

        if (completed) {
            quest.status = 'completed'
        }

        await quest.save()
    }
}

// What the quests looked like before this workout touched them, so a failed save can undo it
const snapshotQuests = (questUpdates = []) => questUpdates.map(({ quest }) => ({
    id: quest._id,
    status: quest.status,
    completion: JSON.parse(JSON.stringify(quest.completion ?? {}))
}))

// Puts quests back as they were and removes the progress this workout logged
const restoreQuests = async (snapshots = [], workoutId) => {
    for (const snapshot of snapshots) {
        await Quest.updateOne(
            { _id: snapshot.id },
            { $set: { status: snapshot.status, completion: snapshot.completion }, $pull: { progressLog: { workoutId } } }
        )
    }
}

module.exports = { detectQuestCompletion, applyQuestResults, snapshotQuests, restoreQuests }
