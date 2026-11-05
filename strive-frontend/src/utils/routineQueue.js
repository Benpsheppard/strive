// routineQueue.js
// The "up next" list for a workout started from a routine (or a repeated workout).
// A queue item is { exercise, selectedEquipment }: `exercise` is a snapshot of the library
// exercise (so a routine can be started with no connection) and `selectedEquipment` is an
// optional hint. Queues hold exercises only, never sets or weights.

const idOf = (exercise) => String(exercise?._id ?? exercise ?? '')

// Keeps only what is needed to log the exercise later
const snapshot = (exercise) => ({
    _id: exercise._id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    subMuscleGroup: exercise.subMuscleGroup,
    trackingMode: exercise.trackingMode,
    equipment: exercise.equipment || [],
    isCustom: Boolean(exercise.isCustom)
})

const fromEntries = (entries) => {
    const seen = new Set()
    const queue = []

    entries.forEach((entry) => {
        const exercise = entry?.exercise
        // An exercise that has since been removed arrives as an id (or null), so it can't be started
        if (!exercise || typeof exercise !== 'object' || !exercise._id) return
        if (seen.has(idOf(exercise))) return

        seen.add(idOf(exercise))
        queue.push({ exercise: snapshot(exercise), selectedEquipment: entry.selectedEquipment || '' })
    })

    return queue
}

export const queueFromRoutine = (routine) => fromEntries(routine?.exercises || [])

export const queueFromWorkout = (workout) => fromEntries(workout?.exercises || [])

// What to send to the server to save a list of exercises as a routine. Accepts populated
// exercises (history) or plain ids (a workout just saved), and keeps each exercise once.
export const routineExercisesFromWorkout = (workout) => {
    const seen = new Set()
    const result = []

    ;(workout?.exercises || []).forEach((entry) => {
        const id = idOf(entry.exercise)
        if (!id || seen.has(id)) return

        seen.add(id)
        result.push({ exercise: id, ...(entry.selectedEquipment ? { selectedEquipment: entry.selectedEquipment } : {}) })
    })

    return result
}

// The queue minus whatever is being logged now and whatever has been finished
export const getUpNext = (queue = [], currentExerciseId, finishedExercises = []) => {
    const finished = new Set(finishedExercises.map(entry => idOf(entry.exercise)))
    const current = currentExerciseId ? String(currentExerciseId) : null

    return queue.filter((item) => {
        const id = idOf(item.exercise)
        return id !== current && !finished.has(id)
    })
}

// Moves the item at `index` up (delta -1) or down (+1). Out-of-range moves change nothing.
export const moveItem = (list, index, delta) => {
    const target = index + delta
    if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list

    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]
    return next
}

export const removeItem = (list, index) => list.filter((_, i) => i !== index)
