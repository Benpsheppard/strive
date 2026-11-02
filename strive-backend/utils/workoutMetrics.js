// workoutMetrics.js
// Helpers for measuring a list of sets

const getMaxWeight = (sets) => Math.max(0, ...sets.map(s => Number(s.weight) || 0))

const getMaxReps = (sets) => Math.max(0, ...sets.map(s => Number(s.reps) || 0))

const getMaxDuration = (sets) => Math.max(0, ...sets.map(s => Number(s.duration) || 0))

const getVolume = (sets) => sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)

const getTotalDistance = (sets) => sets.reduce((sum, s) => sum + (Number(s.distance) || 0), 0)

const getTotalDuration = (sets) => sets.reduce((sum, s) => sum + (Number(s.duration) || 0), 0)

module.exports = {
    getMaxWeight,
    getMaxReps,
    getMaxDuration,
    getVolume,
    getTotalDistance,
    getTotalDuration
}
