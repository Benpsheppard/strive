// exerciseKey.js
// One way of identifying an exercise/equipment pair, shared by quests and personal bests

const buildExerciseKey = (name, equipment) => {
    const normalisedName = (name || '').trim().toLowerCase()
    const normalisedEquipment = (equipment || '').trim().toLowerCase()
    return `${normalisedName}||${normalisedEquipment}`
}

module.exports = { buildExerciseKey }
