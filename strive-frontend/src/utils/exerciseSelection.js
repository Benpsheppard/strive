// exerciseSelection.js
// What happens when an exercise is chosen to be logged: pick the equipment and prefill the
// first set from last time. Shared by the exercise picker and the routine queue.

import { getLastEquipment, getLastSession } from './pbDetection.js'
import { setToRaw, getEmptySet } from './trackingModes.js'

const findOption = (options, wanted) =>
    options.find(option => option.toLowerCase() === String(wanted || '').trim().toLowerCase())

// Returns { currentExercise, currentSet } ready to hand to the logger.
//   exercise            the exercise from the library (or a snapshot saved in a routine)
//   preferredEquipment  a hint, e.g. from a routine; used if the exercise has that equipment
// Equipment is chosen as: the only option, else the hint, else what was used last time, else none
export const startExercise = ({ exercise, workouts = [], useImperial = false, preferredEquipment }) => {
    const options = exercise.equipment || []

    const equipment = options.length === 1
        ? options[0]
        : findOption(options, preferredEquipment) || findOption(options, getLastEquipment(workouts, exercise._id)) || ''

    const session = equipment ? getLastSession(workouts, exercise._id, equipment) : null

    // The inputs start from last session's first set as a suggestion the user can type over
    const currentSet = session?.sets?.length
        ? setToRaw(exercise.trackingMode, session.sets[0], useImperial)
        : getEmptySet(exercise.trackingMode)

    return {
        currentExercise: {
            exerciseId: exercise._id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            trackingMode: exercise.trackingMode,
            equipment: options,
            selectedEquipment: equipment,
            sets: []
        },
        currentSet
    }
}
