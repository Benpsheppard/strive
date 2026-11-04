// pbDetection.js

import { measurePB, beatsPB } from './trackingModes.js'

export const buildPBKey =(name, equipment) =>
    `${name.trim().toLowerCase()}||${(equipment || 'Unspecified').trim().toLowerCase()}`

export const calculatePersonalBests = (workouts) => {
    const exercisePBs = {}

    workouts.forEach((workout) => {
        const workoutDate = workout.date || workout.createdAt || 'Unknown date'

        workout.exercises.forEach((ex) => {
            const exerciseData = ex.exercise
            if (!exerciseData || typeof exerciseData !== 'object') {
                return
            }

            const name = exerciseData.name
            const muscleGroup = exerciseData.muscleGroup || 'Other'
            const trackingMode = exerciseData.trackingMode
            const equipment = ex.selectedEquipment || 'Unspecified'

            if (trackingMode !== 'weight_reps' || typeof name !== 'string' || !name.trim()) {
                return
            }

            const key = buildPBKey(name, equipment)

            ex.sets.forEach((set) => {
                const weight = Number(set.weight) || 0
                if (!exercisePBs[key] || weight > exercisePBs[key].weight) {
                    exercisePBs[key] = { weight, date: workoutDate, muscleGroup, equipment, name }
                }
            })
        })
    })

    return exercisePBs
}

// Best result for every exercise/equipment pair across all supported tracking modes.
// Each entry is { metric, value, date, name, equipment, muscleGroup, trackingMode }.
export const calculateAllPersonalBests = (workouts) => {
    const bests = {}

    workouts.forEach((workout) => {
        const date = workout.date || workout.createdAt || null

        workout.exercises?.forEach((ex) => {
            const data = ex.exercise
            if (!data || typeof data !== 'object' || typeof data.name !== 'string' || !data.name.trim()) {
                return
            }

            const reading = measurePB(data.trackingMode, ex.sets)
            if (!reading || reading.value <= 0) return

            const equipment = ex.selectedEquipment || 'Unspecified'
            const key = buildPBKey(data.name, equipment)

            if (!bests[key] || reading.value > bests[key].value) {
                bests[key] = {
                    metric: reading.metric,
                    value: reading.value,
                    date,
                    name: data.name,
                    equipment,
                    muscleGroup: data.muscleGroup || 'Other',
                    trackingMode: data.trackingMode
                }
            }
        })
    })

    return bests
}

const sameEquipment = (a, b) =>
    (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase()

const exerciseIdOf = (ex) => String(ex.exercise?._id ?? ex.exercise ?? '')

const byNewest = (a, b) =>
    new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)

// The sets the user did the last time they logged this exercise (optionally with this equipment)
export const getLastSession = (workouts, exerciseId, equipment) => {
    if (!exerciseId) return null

    for (const workout of [...workouts].sort(byNewest)) {
        const match = workout.exercises?.find(ex =>
            exerciseIdOf(ex) === String(exerciseId) &&
            (!equipment || sameEquipment(ex.selectedEquipment, equipment)) &&
            ex.sets?.length > 0
        )

        if (match) {
            return {
                date: workout.createdAt || workout.date,
                equipment: match.selectedEquipment,
                sets: match.sets
            }
        }
    }

    return null
}

// The equipment the user used most recently for an exercise
export const getLastEquipment = (workouts, exerciseId) =>
    getLastSession(workouts, exerciseId)?.equipment || null

// PBs a finished workout set compared with earlier workouts. A first-ever result is not a PB.
export const detectNewPBs = (newWorkout, existingWorkouts) => {
    const existing = calculateAllPersonalBests(existingWorkouts)
    const found = []

    newWorkout.exercises.forEach((ex) => {
        const data = ex.exercise
        if (!data || typeof data !== 'object' || typeof data.name !== 'string') return

        const reading = measurePB(data.trackingMode, ex.sets)
        if (!reading || reading.value <= 0) return

        const previous = existing[buildPBKey(data.name, ex.selectedEquipment || 'Unspecified')]
        if (previous && beatsPB(reading.metric, previous.value, reading.value)) {
            found.push({
                exerciseName: data.name,
                metric: reading.metric,
                newValue: reading.value,
                oldValue: previous.value
            })
        }
    })

    return found
}
