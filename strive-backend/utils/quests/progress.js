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

module.exports = { detectQuestCompletion, applyQuestResults }
