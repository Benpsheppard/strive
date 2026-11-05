import { describe, test, expect } from 'vitest'
import {
    queueFromRoutine, queueFromWorkout, routineExercisesFromWorkout, getUpNext, moveItem, removeItem
} from '../utils/routineQueue.js'
import { startExercise } from '../utils/exerciseSelection.js'

const bench = { _id: 'bench', name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest', trackingMode: 'weight_reps', equipment: ['Barbell', 'Dumbbell'] }
const pullUp = { _id: 'pullup', name: 'Pull Up', muscleGroup: 'Back', trackingMode: 'bodyweight_reps', equipment: ['Bodyweight'] }
const squat = { _id: 'squat', name: 'Squat', muscleGroup: 'Legs', trackingMode: 'weight_reps', equipment: ['Barbell'] }

describe('building a queue', () => {
    test('from a routine, in order, with the equipment hints', () => {
        const queue = queueFromRoutine({
            exercises: [
                { exercise: bench, selectedEquipment: 'Dumbbell' },
                { exercise: pullUp }
            ]
        })

        expect(queue.map(q => q.exercise.name)).toEqual(['Bench Press', 'Pull Up'])
        expect(queue[0].selectedEquipment).toBe('Dumbbell')
        expect(queue[1].selectedEquipment).toBe('')
    })

    test('keeps a snapshot of the exercise so it can start offline, and drops extra fields', () => {
        const [item] = queueFromRoutine({ exercises: [{ exercise: { ...bench, createdAt: 'x', __v: 3 } }] })

        expect(item.exercise).toEqual({
            _id: 'bench', name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest',
            trackingMode: 'weight_reps', equipment: ['Barbell', 'Dumbbell'], isCustom: false
        })
    })

    test('skips exercises that no longer exist and repeats', () => {
        const queue = queueFromRoutine({
            exercises: [{ exercise: bench }, { exercise: null }, { exercise: 'only-an-id' }, { exercise: bench }]
        })

        expect(queue).toHaveLength(1)
    })

    test('from a past workout, ignoring its sets', () => {
        const queue = queueFromWorkout({
            exercises: [
                { exercise: squat, selectedEquipment: 'Barbell', sets: [{ weight: 100, reps: 5 }] },
                { exercise: bench, selectedEquipment: 'Barbell', sets: [{ weight: 60, reps: 8 }] }
            ]
        })

        expect(queue.map(q => q.exercise.name)).toEqual(['Squat', 'Bench Press'])
        queue.forEach(item => expect(Object.keys(item).sort()).toEqual(['exercise', 'selectedEquipment']))
        expect(JSON.stringify(queue)).not.toMatch(/"sets"|"weight"|"reps"/)
    })

    test('handles missing data', () => {
        expect(queueFromRoutine(undefined)).toEqual([])
        expect(queueFromWorkout({})).toEqual([])
    })
})

describe('saving a workout as a routine', () => {
    test('sends ids and equipment only, once each', () => {
        const payload = routineExercisesFromWorkout({
            exercises: [
                { exercise: bench, selectedEquipment: 'Barbell', sets: [{ weight: 60, reps: 8 }] },
                { exercise: 'squat', selectedEquipment: 'Barbell' },
                { exercise: bench },
                { exercise: pullUp }
            ]
        })

        expect(payload).toEqual([
            { exercise: 'bench', selectedEquipment: 'Barbell' },
            { exercise: 'squat', selectedEquipment: 'Barbell' },
            { exercise: 'pullup' }
        ])
    })

    test('copes with an empty workout', () => {
        expect(routineExercisesFromWorkout({ exercises: [] })).toEqual([])
        expect(routineExercisesFromWorkout(undefined)).toEqual([])
    })
})

describe('what is up next', () => {
    const queue = queueFromRoutine({ exercises: [{ exercise: bench }, { exercise: squat }, { exercise: pullUp }] })

    test('everything, before anything is started', () => {
        expect(getUpNext(queue, null, []).map(q => q.exercise._id)).toEqual(['bench', 'squat', 'pullup'])
    })

    test('leaves out the exercise being logged and the ones already finished', () => {
        const finished = [{ exercise: 'bench' }]
        expect(getUpNext(queue, 'squat', finished).map(q => q.exercise._id)).toEqual(['pullup'])
    })

    test('exercises finished in the workout leave the queue even when started from search', () => {
        expect(getUpNext(queue, null, [{ exercise: 'pullup' }]).map(q => q.exercise._id)).toEqual(['bench', 'squat'])
    })

    test('an empty queue stays empty', () => {
        expect(getUpNext([], 'x', [])).toEqual([])
        expect(getUpNext(undefined, 'x', [])).toEqual([])
    })
})

describe('reordering', () => {
    test('moves an item up or down', () => {
        expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c'])
        expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b'])
    })

    test('does nothing past either end, and never changes the original list', () => {
        const list = ['a', 'b', 'c']
        expect(moveItem(list, 0, -1)).toBe(list)
        expect(moveItem(list, 2, 1)).toBe(list)
        expect(moveItem(list, 5, 1)).toBe(list)
        moveItem(list, 0, 1)
        expect(list).toEqual(['a', 'b', 'c'])
    })

    test('removes an item', () => {
        expect(removeItem(['a', 'b', 'c'], 1)).toEqual(['a', 'c'])
    })
})

describe('starting an exercise', () => {
    const lastWeek = (equipment, sets) => ({
        createdAt: '2026-10-28T10:00:00Z',
        exercises: [{ exercise: bench, selectedEquipment: equipment, sets }]
    })

    test('a single equipment option is chosen for you, and the inputs start empty with no history', () => {
        const { currentExercise, currentSet } = startExercise({ exercise: pullUp })

        expect(currentExercise.selectedEquipment).toBe('Bodyweight')
        expect(currentExercise.sets).toEqual([])
        expect(currentSet).toEqual({ reps: '' })
    })

    test('a routine hint wins over what was used last time', () => {
        const history = [lastWeek('Barbell', [{ weight: 80, reps: 8 }])]
        const { currentExercise } = startExercise({ exercise: bench, workouts: history, preferredEquipment: 'dumbbell' })

        expect(currentExercise.selectedEquipment).toBe('Dumbbell')
    })

    test('without a hint it reuses the equipment from last time', () => {
        const history = [lastWeek('Dumbbell', [{ weight: 30, reps: 10 }])]
        const { currentExercise } = startExercise({ exercise: bench, workouts: history })

        expect(currentExercise.selectedEquipment).toBe('Dumbbell')
    })

    test('an unusable hint is ignored; with nothing to go on the user chooses', () => {
        const { currentExercise } = startExercise({ exercise: bench, preferredEquipment: 'Kettlebell' })

        expect(currentExercise.selectedEquipment).toBe('')
    })

    test("starts with last session's first set typed in as a suggestion, but no sets logged", () => {
        const history = [lastWeek('Barbell', [{ weight: 80, reps: 8 }, { weight: 80, reps: 7 }])]
        const { currentExercise, currentSet } = startExercise({ exercise: bench, workouts: history, preferredEquipment: 'Barbell' })

        expect(currentExercise.sets).toEqual([])
        expect(currentSet).toEqual({ weight: '80', reps: '8' })
    })

    test('converts the suggestion to pounds for imperial users', () => {
        const history = [lastWeek('Barbell', [{ weight: 61.2, reps: 5 }])]
        const { currentSet } = startExercise({ exercise: bench, workouts: history, preferredEquipment: 'Barbell', useImperial: true })

        expect(currentSet.weight).toBe('134.9')
    })
})
