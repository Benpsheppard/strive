import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

vi.mock('../features/routines/routineService.js', async (importOriginal) => {
    const original = await importOriginal()
    return {
        ...original,
        default: { getRoutines: vi.fn(), createRoutine: vi.fn(), updateRoutine: vi.fn(), deleteRoutine: vi.fn() }
    }
})
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import { toast } from 'react-toastify'
import routineService, { saveRoutineCache, readRoutineCache } from '../features/routines/routineService.js'
import routineReducer, { getRoutines, createRoutine, updateRoutine, deleteRoutine } from '../features/routines/routineSlice.js'
import exerciseReducer from '../features/exercises/exerciseSlice.js'
import ExerciseQueue from '../components/workouts/ExerciseQueue.jsx'
import RoutineList from '../components/routines/RoutineList.jsx'
import RoutineEditor from '../components/routines/RoutineEditor.jsx'
import SaveRoutineDialog from '../components/routines/SaveRoutineDialog.jsx'
import WorkoutDashBoard from '../components/workouts/WorkoutDashboard.jsx'
import { ConfirmProvider } from '../components/ui/ConfirmProvider.jsx'

const USER = { _id: 'u1', username: 'ben', token: 't', isGuest: false, level: 2, strivepoints: 150, target: 3, useImperial: false }

const bench = { _id: 'bench', name: 'Bench Press', muscleGroup: 'Chest', subMuscleGroup: 'Mid chest', trackingMode: 'weight_reps', equipment: ['Barbell', 'Dumbbell'] }
const squat = { _id: 'squat', name: 'Squat', muscleGroup: 'Legs', subMuscleGroup: 'Quads', trackingMode: 'weight_reps', equipment: ['Barbell'] }
const pullUp = { _id: 'pullup', name: 'Pull Up', muscleGroup: 'Back', subMuscleGroup: 'Lats', trackingMode: 'bodyweight_reps', equipment: ['Bodyweight'] }

const routine = (id, name, entries) => ({ _id: id, name, exercises: entries })
const pushDay = routine('r1', 'Push day', [{ exercise: bench, selectedEquipment: 'Barbell' }, { exercise: squat }])

const makeStore = (routineState = {}, library = [bench, squat, pullUp]) => configureStore({
    reducer: { auth: (state = { user: USER }) => state, routine: routineReducer, exercise: exerciseReducer, workout: (state = { workouts: [] }) => state },
    preloadedState: {
        routine: { routines: [], isLoading: false, isLoaded: false, isOffline: false, ...routineState },
        exercise: { exercises: library, isError: false, isSuccess: false, isLoading: false, message: '' }
    }
})

const renderWith = (ui, store = makeStore()) => render(
    <Provider store={store}><ConfirmProvider><MemoryRouter>{ui}</MemoryRouter></ConfirmProvider></Provider>
)

const networkError = () => Object.assign(new Error('Network Error'), { response: undefined })
const serverError = (status, message) => ({ response: { status, data: { message } } })

beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
})
afterEach(cleanup)

describe('routine state', () => {
    test('loads the list and keeps a copy on the device', async () => {
        routineService.getRoutines.mockResolvedValue([pushDay])
        const store = makeStore()

        await store.dispatch(getRoutines())

        expect(store.getState().routine.routines).toEqual([pushDay])
        expect(store.getState().routine.isLoaded).toBe(true)
        expect(store.getState().routine.isOffline).toBe(false)
    })

    test('with no connection it falls back to the copy on the device', async () => {
        saveRoutineCache('u1', [pushDay])
        routineService.getRoutines.mockRejectedValue(networkError())
        const store = makeStore()

        await store.dispatch(getRoutines())

        expect(store.getState().routine.routines).toEqual([pushDay])
        expect(store.getState().routine.isOffline).toBe(true)
    })

    test("never uses another user's saved copy", async () => {
        saveRoutineCache('someone-else', [pushDay])
        routineService.getRoutines.mockRejectedValue(networkError())
        const store = makeStore()

        await store.dispatch(getRoutines())

        expect(store.getState().routine.routines).toEqual([])
        expect(readRoutineCache('u1')).toBeNull()
    })

    test('a refusal from the server is not papered over with the saved copy', async () => {
        saveRoutineCache('u1', [pushDay])
        routineService.getRoutines.mockRejectedValue(serverError(401, 'Not authorised'))
        const store = makeStore()

        await store.dispatch(getRoutines())

        expect(store.getState().routine.routines).toEqual([])
    })

    test('create, update and delete change the list and the saved copy together', async () => {
        const store = makeStore({ routines: [pushDay], isLoaded: true })
        const pull = routine('r2', 'Pull day', [{ exercise: pullUp }])

        routineService.createRoutine.mockResolvedValue(pull)
        await store.dispatch(createRoutine({ name: 'Pull day', exercises: [] }))
        expect(store.getState().routine.routines.map(r => r.name)).toEqual(['Pull day', 'Push day'])
        expect(readRoutineCache('u1').map(r => r.name)).toEqual(['Pull day', 'Push day'])

        routineService.updateRoutine.mockResolvedValue({ ...pushDay, name: 'Push A' })
        await store.dispatch(updateRoutine({ id: 'r1', name: 'Push A' }))
        expect(store.getState().routine.routines.map(r => r.name)).toEqual(['Push A', 'Pull day'])

        routineService.deleteRoutine.mockResolvedValue({})
        await store.dispatch(deleteRoutine('r2'))
        expect(store.getState().routine.routines.map(r => r.name)).toEqual(['Push A'])
        expect(readRoutineCache('u1').map(r => r.name)).toEqual(['Push A'])
    })

    test('a failed create leaves the list alone and reports why', async () => {
        const store = makeStore({ routines: [pushDay], isLoaded: true })
        routineService.createRoutine.mockRejectedValue(serverError(409, 'You already have a routine with that name'))

        const result = await store.dispatch(createRoutine({ name: 'Push day', exercises: [] }))

        expect(result.payload).toBe('You already have a routine with that name')
        expect(store.getState().routine.routines).toEqual([pushDay])
    })
})

describe('the up next queue', () => {
    const items = [{ exercise: bench, selectedEquipment: 'Barbell' }, { exercise: squat, selectedEquipment: '' }, { exercise: pullUp, selectedEquipment: '' }]

    test('the first exercise can be started; the rest can be moved or skipped', async () => {
        const user = userEvent.setup()
        const onStart = vi.fn(), onSkip = vi.fn(), onMove = vi.fn()
        render(<ExerciseQueue items={items} canStart onStart={onStart} onSkip={onSkip} onMove={onMove} />)

        expect(screen.getByText('3 to go')).toBeTruthy()
        await user.click(screen.getByRole('button', { name: 'Start Bench Press' }))
        expect(onStart).toHaveBeenCalledWith(items[0])

        await user.click(screen.getByRole('button', { name: 'Move Squat down' }))
        expect(onMove).toHaveBeenCalledWith(1, 1)

        await user.click(screen.getByRole('button', { name: 'Skip Pull Up' }))
        expect(onSkip).toHaveBeenCalledWith(2)

        // Only the first has a Start button
        expect(screen.queryByRole('button', { name: 'Start Squat' })).toBeNull()
    })

    test("the first can't move up and the last can't move down", () => {
        render(<ExerciseQueue items={items} canStart onStart={vi.fn()} onSkip={vi.fn()} onMove={vi.fn()} />)

        expect(screen.getByRole('button', { name: 'Move Bench Press up' }).disabled).toBe(true)
        expect(screen.getByRole('button', { name: 'Move Pull Up down' }).disabled).toBe(true)
    })

    test('while another exercise is being logged, Start is off and explains why', () => {
        render(<ExerciseQueue items={items} canStart={false} onStart={vi.fn()} onSkip={vi.fn()} onMove={vi.fn()} />)

        expect(screen.getByRole('button', { name: 'Start Bench Press' }).disabled).toBe(true)
        expect(screen.getByText(/Finish the exercise you are logging/)).toBeTruthy()
    })

    test('shows nothing when the queue is empty', () => {
        const { container } = render(<ExerciseQueue items={[]} canStart onStart={vi.fn()} onSkip={vi.fn()} onMove={vi.fn()} />)
        expect(container.firstChild).toBeNull()
    })
})

describe('routines on the dashboard', () => {
    test('lists routines with a Start button each', async () => {
        const user = userEvent.setup()
        const onStart = vi.fn()
        renderWith(<RoutineList routines={[pushDay]} onStart={onStart} />)

        expect(screen.getByText('Push day')).toBeTruthy()
        expect(screen.getByText('Bench Press · Squat')).toBeTruthy()
        await user.click(screen.getByRole('button', { name: 'Start Push day' }))
        expect(onStart).toHaveBeenCalledWith(pushDay)
    })

    test('explains how to get a first routine when there are none', () => {
        renderWith(<RoutineList routines={[]} onStart={vi.fn()} />)

        expect(screen.getByText(/Save as routine/)).toBeTruthy()
        expect(screen.getByRole('link', { name: 'Create one' }).getAttribute('href')).toBe('/routines')
    })

    test('says when it is showing the copy saved on the device', () => {
        renderWith(<RoutineList routines={[pushDay]} isOffline onStart={vi.fn()} />)
        expect(screen.getByText(/saved on this device/)).toBeTruthy()
    })

    const history = (title, exercises) => ({ _id: `w-${title}`, title, createdAt: '2026-11-01T10:00:00Z', duration: 40, summary: {}, exercises })

    test('"Repeat last workout" starts with the exercises of the latest workout, and no sets', async () => {
        const user = userEvent.setup()
        const startWorkout = vi.fn()
        const latest = history('Leg day', [{ exercise: squat, selectedEquipment: 'Barbell', sets: [{ weight: 100, reps: 5 }] }])
        const older = { ...history('Old', [{ exercise: bench, selectedEquipment: 'Barbell', sets: [] }]), createdAt: '2026-10-01T10:00:00Z' }

        renderWith(<WorkoutDashBoard user={USER} workouts={[older, latest]} routines={[]} startWorkout={startWorkout} />)

        await user.click(screen.getByRole('button', { name: /Repeat last workout \(Leg day\)/ }))

        const [{ queue, title }] = startWorkout.mock.calls[0]
        expect(title).toBe('Leg day')
        expect(queue.map(q => q.exercise.name)).toEqual(['Squat'])
        expect(JSON.stringify(queue)).not.toMatch(/"sets"|"reps"|"weight"/)
    })

    test('the plain Start button starts an empty workout', async () => {
        const user = userEvent.setup()
        const startWorkout = vi.fn()
        renderWith(<WorkoutDashBoard user={USER} workouts={[]} routines={[]} startWorkout={startWorkout} />)

        await user.click(screen.getByRole('button', { name: 'Start workout' }))

        expect(startWorkout).toHaveBeenCalledWith()
        expect(screen.queryByRole('button', { name: /Repeat last workout/ })).toBeNull()
    })

    test('starting a routine from the dashboard passes its exercises and name', async () => {
        const user = userEvent.setup()
        const startWorkout = vi.fn()
        renderWith(<WorkoutDashBoard user={USER} workouts={[history('x', [])]} routines={[pushDay]} startWorkout={startWorkout} />)

        await user.click(screen.getByRole('button', { name: 'Start Push day' }))

        const [{ queue, title }] = startWorkout.mock.calls[0]
        expect(title).toBe('Push day')
        expect(queue.map(q => q.exercise.name)).toEqual(['Bench Press', 'Squat'])
        expect(queue[0].selectedEquipment).toBe('Barbell')
    })
})

describe('saving a workout as a routine', () => {
    const exercises = [{ exercise: 'bench', selectedEquipment: 'Barbell' }]

    test('sends the name and exercises and reports success', async () => {
        routineService.createRoutine.mockResolvedValue(pushDay)
        const user = userEvent.setup()
        const onSaved = vi.fn(), onClose = vi.fn()
        renderWith(<SaveRoutineDialog open initialName="Evening Workout" exercises={exercises} onSaved={onSaved} onClose={onClose} />)

        const name = screen.getByLabelText('Routine name')
        expect(name.value).toBe('Evening Workout')
        await user.clear(name)
        await user.type(name, 'Push day')
        await user.click(screen.getByRole('button', { name: 'Save routine' }))

        await waitFor(() => expect(onSaved).toHaveBeenCalled())
        expect(routineService.createRoutine).toHaveBeenCalledWith({ name: 'Push day', exercises }, 't')
        expect(onClose).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalled()
    })

    test('says plainly that no sets are saved', () => {
        renderWith(<SaveRoutineDialog open initialName="x" exercises={exercises} onClose={vi.fn()} />)
        expect(screen.getByText(/Sets and weights are not saved/)).toBeTruthy()
    })

    test('needs a name, and shows the server\'s reason when it refuses', async () => {
        routineService.createRoutine.mockRejectedValue(serverError(409, 'You already have a routine with that name'))
        const user = userEvent.setup()
        const onClose = vi.fn()
        renderWith(<SaveRoutineDialog open initialName="" exercises={exercises} onClose={onClose} />)

        await user.click(screen.getByRole('button', { name: 'Save routine' }))
        expect(screen.getByText('Give the routine a name')).toBeTruthy()
        expect(routineService.createRoutine).not.toHaveBeenCalled()

        await user.type(screen.getByLabelText('Routine name'), 'Push day')
        await user.click(screen.getByRole('button', { name: 'Save routine' }))

        expect(await screen.findByText('You already have a routine with that name')).toBeTruthy()
        expect(onClose).not.toHaveBeenCalled()
    })
})

describe('the routine editor', () => {
    const open = async (props = {}) => {
        const user = userEvent.setup()
        const onSave = vi.fn().mockResolvedValue(null)
        renderWith(<RoutineEditor onSave={onSave} onCancel={vi.fn()} {...props} />)
        return { user, onSave }
    }

    const addByName = async (user, query, optionName) => {
        const search = screen.getByRole('combobox', { name: 'Search exercises' })
        await user.click(search)
        await user.type(search, query)
        await user.click(await screen.findByRole('option', { name: new RegExp(`^${optionName}`) }))
    }

    test('builds a routine from searched exercises, in order, with an equipment hint', async () => {
        const { user, onSave } = await open()

        await user.type(screen.getByLabelText('Routine name'), 'Upper')
        await addByName(user, 'bench', 'Bench Press')
        await addByName(user, 'pull', 'Pull Up')
        await user.selectOptions(screen.getByLabelText('Equipment for Bench Press'), 'Dumbbell')
        await user.click(screen.getByRole('button', { name: 'Move Pull Up up' }))
        await user.click(screen.getByRole('button', { name: 'Create routine' }))

        expect(onSave).toHaveBeenCalledWith({
            name: 'Upper',
            exercises: [{ exercise: 'pullup' }, { exercise: 'bench', selectedEquipment: 'Dumbbell' }]
        })
    })

    test('an exercise can only be added once, and can be removed', async () => {
        const { user } = await open()

        await addByName(user, 'bench', 'Bench Press')
        await addByName(user, 'bench', 'Bench Press')
        const list = screen.getByRole('list', { name: 'Exercises in this routine' })
        expect(within(list).getAllByRole('listitem')).toHaveLength(1)

        await user.click(screen.getByRole('button', { name: 'Remove Bench Press' }))
        expect(screen.queryByRole('list', { name: 'Exercises in this routine' })).toBeNull()
    })

    test('needs a name and at least one exercise', async () => {
        const { user, onSave } = await open()

        await user.click(screen.getByRole('button', { name: 'Create routine' }))
        expect(screen.getByRole('alert').textContent).toBe('Give the routine a name')

        await user.type(screen.getByLabelText('Routine name'), 'Empty')
        await user.click(screen.getByRole('button', { name: 'Create routine' }))
        expect(screen.getByRole('alert').textContent).toBe('Add at least one exercise')

        expect(onSave).not.toHaveBeenCalled()
    })

    test('editing starts from the saved routine and shows the server\'s complaint', async () => {
        const onSave = vi.fn().mockResolvedValue('You already have a routine with that name')
        const user = userEvent.setup()
        renderWith(<RoutineEditor routine={pushDay} onSave={onSave} onCancel={vi.fn()} />)

        expect(screen.getByLabelText('Routine name').value).toBe('Push day')
        expect(screen.getByLabelText('Equipment for Bench Press').value).toBe('Barbell')

        await user.click(screen.getByRole('button', { name: 'Save changes' }))

        expect(await screen.findByText('You already have a routine with that name')).toBeTruthy()
        expect(onSave).toHaveBeenCalledWith({
            name: 'Push day',
            exercises: [{ exercise: 'bench', selectedEquipment: 'Barbell' }, { exercise: 'squat' }]
        })
    })
})
