// Routines.jsx
// Create, change, start and delete routines

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaListUl } from 'react-icons/fa'

import { getRoutines, createRoutine, updateRoutine, deleteRoutine } from '../features/routines/routineSlice.js'
import { getExercises } from '../features/exercises/exerciseSlice.js'
import { getWorkouts } from '../features/workouts/workoutsSlice.js'
import { useAlerts } from '../hooks/useAlerts.js'
import { queueFromRoutine } from '../utils/routineQueue.js'

import PageTitle from '../components/ui/PageTitle.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import RoutineEditor from '../components/routines/RoutineEditor.jsx'
import Spinner from '../components/spinners/Spinner.jsx'

const Routines = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const alerts = useAlerts()

    const { routines, isLoaded, isOffline } = useSelector((state) => state.routine)

    // null = just browsing, 'new' = creating, or the id of the routine being changed
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        dispatch(getRoutines())
        dispatch(getExercises())
        dispatch(getWorkouts())
    }, [dispatch])

    const save = async (payload) => {
        const result = editing === 'new'
            ? await dispatch(createRoutine(payload))
            : await dispatch(updateRoutine({ id: editing, ...payload }))

        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(editing === 'new' ? 'Routine created' : 'Routine updated')
            setEditing(null)
            return null
        }

        return result.payload || 'Could not save the routine'
    }

    const remove = async (routine) => {
        if (!(await alerts.deleteRoutine(routine.name))) return

        const result = await dispatch(deleteRoutine(routine._id))
        if (result.meta.requestStatus === 'rejected') toast.error(result.payload || 'Could not delete the routine')
    }

    // Starts a workout from the dashboard's logger with this routine queued
    const start = (routine) => navigate('/', { state: { queue: queueFromRoutine(routine), title: routine.name } })

    if (!isLoaded) return <Spinner />

    const editingRoutine = editing && editing !== 'new' ? routines.find(r => r._id === editing) : undefined

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="routines" subtitle="Save the exercises you do regularly and start them in one tap. Sets and weights are not saved, so you enter your own each time.">
                Your
            </PageTitle>

            {isOffline && <p role="status" className="text-center text-sm text-muted">You are offline, so these are the routines saved on this device. Changes need a connection.</p>}

            {editing ? (
                <RoutineEditor
                    key={editing}
                    routine={editingRoutine}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                />
            ) : (
                <Button fullWidth onClick={() => setEditing('new')} disabled={isOffline}>New routine</Button>
            )}

            {!editing && routines.length === 0 && (
                <EmptyState
                    icon={FaListUl}
                    title="No routines yet"
                    message="Create one above, or finish a workout and choose Save as routine."
                />
            )}

            {!editing && routines.length > 0 && (
                <ul className="space-y-3">
                    {routines.map(routine => (
                        <li key={routine._id}>
                            <Card as="article" aria-labelledby={`routine-${routine._id}`} className="space-y-3">
                                <div>
                                    <h2 id={`routine-${routine._id}`} className="font-display text-2xl font-bold">{routine.name}</h2>
                                    <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-muted">
                                        {routine.exercises.map(item => (
                                            <li key={item.exercise?._id || item._id}>
                                                <span className="text-fg">{item.exercise?.name || 'Removed exercise'}</span>
                                                {item.selectedEquipment && ` · ${item.selectedEquipment}`}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={() => start(routine)} aria-label={`Start ${routine.name}`}>Start</Button>
                                    <Button variant="secondary" onClick={() => setEditing(routine._id)} disabled={isOffline} aria-label={`Edit ${routine.name}`}>Edit</Button>
                                    <Button variant="danger" onClick={() => remove(routine)} disabled={isOffline} aria-label={`Delete ${routine.name}`}>Delete</Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Routines
