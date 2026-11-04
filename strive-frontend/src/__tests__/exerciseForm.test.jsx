import { describe, test, expect, afterEach, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import ExerciseForm from '../components/workouts/ExerciseForm.jsx'
import { ConfirmProvider } from '../components/ui/ConfirmProvider.jsx'
import exerciseReducer from '../features/exercises/exerciseSlice.js'
import { EMPTY_EXERCISE } from '../utils/constants.js'

afterEach(cleanup)

const library = [
    { _id: 'bench', name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest', equipment: ['Barbell', 'Dumbbell'], trackingMode: 'weight_reps' },
    { _id: 'pullup', name: 'Pull Up', muscleGroup: 'Back', subMuscleGroup: 'Lats', equipment: ['Bodyweight'], trackingMode: 'bodyweight_reps' },
    { _id: 'run', name: 'Running', muscleGroup: 'Cardio', subMuscleGroup: 'Cardio', equipment: ['Treadmill'], trackingMode: 'distance_duration' }
]

const lastWeek = {
    createdAt: '2026-10-28T10:00:00Z',
    exercises: [{
        exercise: library[0],
        selectedEquipment: 'Barbell',
        sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 7 }]
    }]
}

// Mirrors how NewWorkout holds the state
const Harness = ({ workouts = [], useImperial = false, onFinished, startRestTimer = () => {} }) => {
    const [currentExercise, setCurrentExercise] = useState(EMPTY_EXERCISE)
    const [currentSet, setCurrentSet] = useState({})

    return (
        <ExerciseForm
            workouts={workouts}
            allExercises={library}
            useImperial={useImperial}
            currentExercise={currentExercise}
            setCurrentExercise={setCurrentExercise}
            currentSet={currentSet}
            setCurrentSet={setCurrentSet}
            setExercises={(update) => onFinished?.(typeof update === 'function' ? update([]) : update)}
            restTimerDuration={60}
            startRestTimer={startRestTimer}
        />
    )
}

const renderForm = (props) => {
    const store = configureStore({ reducer: { exercise: exerciseReducer, auth: () => ({ user: { token: 't' } }) } })
    return render(
        <Provider store={store}>
            <ConfirmProvider>
                <Harness {...props} />
            </ConfirmProvider>
        </Provider>
    )
}

const choose = async (user, text, optionName) => {
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), text)
    await user.click(await screen.findByRole('option', { name: new RegExp(optionName) }))
}

describe('logging a bodyweight exercise', () => {
    test('only asks for reps, picks the single equipment, and logs sets', async () => {
        const user = userEvent.setup()
        const startRestTimer = vi.fn()
        renderForm({ startRestTimer })

        await choose(user, 'pull', 'Pull Up')

        expect(screen.getByLabelText('Reps')).toBeTruthy()
        expect(screen.queryByLabelText(/Weight/)).toBeNull()
        expect(screen.queryByLabelText('Equipment')).toBeNull()

        await user.type(screen.getByLabelText('Reps'), '8')
        await user.click(screen.getByRole('button', { name: 'Add set' }))

        const list = screen.getByRole('list', { name: /sets logged/i })
        expect(within(list).getByText('8 reps')).toBeTruthy()
        expect(startRestTimer).toHaveBeenCalledTimes(1)

        // The next set is prefilled from the previous one
        expect(screen.getByLabelText('Reps').value).toBe('8')
    })

    test('shows an inline error instead of saving an empty set', async () => {
        const user = userEvent.setup()
        renderForm()

        await choose(user, 'pull', 'Pull Up')
        await user.click(screen.getByRole('button', { name: 'Add set' }))

        expect(await screen.findByText('Enter reps')).toBeTruthy()
        expect(screen.queryByRole('list', { name: /sets logged/i })).toBeNull()
    })
})

describe('logging a weighted exercise', () => {
    test('needs equipment before a set can be added', async () => {
        const user = userEvent.setup()
        renderForm()

        await choose(user, 'bench', 'Bench Press')
        await user.type(screen.getByLabelText('Weight (kg)'), '60')
        await user.type(screen.getByLabelText('Reps'), '5')
        await user.click(screen.getByRole('button', { name: 'Add set' }))

        expect(await screen.findByText('Choose the equipment you used first.')).toBeTruthy()
    })

    test('imperial users type pounds and see pounds', async () => {
        const user = userEvent.setup()
        renderForm({ useImperial: true })

        await choose(user, 'bench', 'Bench Press')
        await user.selectOptions(screen.getByLabelText('Equipment'), 'Barbell')
        await user.type(screen.getByLabelText('Weight (lbs)'), '135')
        await user.type(screen.getByLabelText('Reps'), '5')
        await user.click(screen.getByRole('button', { name: 'Add set' }))

        expect(screen.getByText('135.0 lbs × 5')).toBeTruthy()
    })

    test('shows last session and prefills from it, remembering the equipment', async () => {
        const user = userEvent.setup()
        renderForm({ workouts: [lastWeek] })

        await choose(user, 'bench', 'Bench Press')

        // Barbell was used last time, so it is already selected
        expect(screen.getByLabelText('Equipment').value).toBe('Barbell')
        expect(screen.getByText(/Last time/)).toBeTruthy()
        expect(screen.getByText(/80.0 kg × 8 · 80.0 kg × 7/)).toBeTruthy()
        expect(screen.getByLabelText('Weight (kg)').value).toBe('80')
        expect(screen.getByLabelText('Reps').value).toBe('8')
    })

    test('a set can be edited and deleted', async () => {
        const user = userEvent.setup()
        renderForm({ workouts: [lastWeek] })

        await choose(user, 'bench', 'Bench Press')
        await user.click(screen.getByRole('button', { name: 'Add set' }))
        await user.click(screen.getByRole('button', { name: 'Add set' }))

        const list = screen.getByRole('list', { name: /sets logged/i })
        expect(within(list).getAllByRole('listitem')).toHaveLength(2)

        // Fix set 1
        await user.click(screen.getByRole('button', { name: 'Edit set 1' }))
        const reps = screen.getByLabelText('Reps')
        await user.clear(reps)
        await user.type(reps, '10')
        await user.click(screen.getByRole('button', { name: 'Update set' }))

        expect(within(list).getByText('80.0 kg × 10')).toBeTruthy()

        // Remove set 2
        await user.click(screen.getByRole('button', { name: 'Delete set 2' }))
        expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    })

    test('finishing an exercise hands it to the workout', async () => {
        const user = userEvent.setup()
        const finished = []
        renderForm({ workouts: [lastWeek], onFinished: (list) => finished.push(...list) })

        await choose(user, 'bench', 'Bench Press')
        await user.click(screen.getByRole('button', { name: 'Add set' }))
        await user.click(screen.getByRole('button', { name: 'Finish exercise' }))

        expect(finished).toHaveLength(1)
        expect(finished[0]).toMatchObject({
            exercise: 'bench',
            selectedEquipment: 'Barbell',
            trackingMode: 'weight_reps',
            sets: [{ weight: 80, reps: 8 }]
        })
    })
})

describe('logging cardio', () => {
    test('asks for distance and time and stores seconds', async () => {
        const user = userEvent.setup()
        const finished = []
        renderForm({ onFinished: (list) => finished.push(...list) })

        await choose(user, 'run', 'Running')
        await user.type(screen.getByLabelText('Distance (km)'), '5')
        await user.type(screen.getByLabelText('Time (min)'), '25')
        await user.click(screen.getByRole('button', { name: 'Add set' }))
        await user.click(screen.getByRole('button', { name: 'Finish exercise' }))

        expect(finished[0].sets).toEqual([{ distance: 5, duration: 1500 }])
    })
})

describe('exercise search', () => {
    test('offers to create a custom exercise when nothing matches', async () => {
        const user = userEvent.setup()
        renderForm()

        await user.click(screen.getByRole('combobox'))
        await user.type(screen.getByRole('combobox'), 'zzzz')

        expect(await screen.findByText(/No exercises match/)).toBeTruthy()
        expect(screen.getByRole('button', { name: /Create custom exercise/ })).toBeTruthy()
    })

    test('can be driven with the keyboard', async () => {
        const user = userEvent.setup()
        renderForm()

        await user.click(screen.getByRole('combobox'))
        await user.type(screen.getByRole('combobox'), 'p')
        await user.keyboard('{ArrowDown}{Enter}')

        // Second match for "p" (alphabetical, starts-with first) is chosen
        expect(await screen.findByRole('button', { name: 'Change' })).toBeTruthy()
    })
})
