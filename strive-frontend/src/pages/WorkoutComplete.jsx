// WorkoutComplete.jsx
// Summary shown right after finishing a workout

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { getWorkouts, clearLastWorkoutStats } from '../features/workouts/workoutsSlice'

import Spinner from '../components/spinners/Spinner'
import GuestCard from '../components/guest/GuestCard'
import StrivePointsEarned from '../components/workout-complete/StrivePointsEarned'
import WorkoutStats from '../components/workout-complete/WorkoutStats'
import PBDisplay from '../components/workout-complete/PBDisplay'
import QuestsCompleted from '../components/workout-complete/QuestsCompleted'
import BadgesEarned from '../components/workout-complete/BadgesEarned'
import RadarGraph from '../components/workout-complete/RadarGraph'
import PageTitle from '../components/ui/PageTitle.jsx'
import SaveRoutineDialog from '../components/routines/SaveRoutineDialog.jsx'
import { routineExercisesFromWorkout } from '../utils/routineQueue.js'
import Button from '../components/ui/Button.jsx'

const WorkoutComplete = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, lastWorkoutStats } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const workout = lastWorkoutStats?.workout
    const [savingRoutine, setSavingRoutine] = useState(false)
    const [routineSaved, setRoutineSaved] = useState(false)

    // Refreshing this page loses the summary, so go back to the start
    useEffect(() => {
        if (!workout) navigate('/', { replace: true })
    }, [workout, navigate])

    // The radar chart compares this workout with earlier ones
    useEffect(() => {
        dispatch(getWorkouts())
    }, [dispatch])

    if (!workout) return <Spinner />

    const routineExercises = routineExercisesFromWorkout(workout)

    const hasStats = lastWorkoutStats.levelUp || lastWorkoutStats.streakIncreased ||
        lastWorkoutStats.momentumGained || lastWorkoutStats.shieldEarned ||
        lastWorkoutStats.shieldUsed || lastWorkoutStats.streakBroken

    const onContinue = () => {
        if (hasStats) {
            navigate('/progress-update')
        } else {
            dispatch(clearLastWorkoutStats())
            navigate('/')
        }
    }

    const onViewProgress = () => {
        dispatch(clearLastWorkoutStats())
        navigate('/progress')
    }

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="complete!" subtitle={workout.title}>Workout</PageTitle>

            {user.isGuest && <GuestCard workouts={workouts} />}

            <WorkoutStats workout={workout} user={user} />
            <StrivePointsEarned workout={workout} />
            <PBDisplay workout={workout} user={user} />
            <QuestsCompleted workout={workout} />
            <BadgesEarned badges={lastWorkoutStats.newBadges} />
            <RadarGraph workouts={workouts} workout={workout} />

            <div className="flex flex-col gap-3 pt-2">
                <Button size="lg" fullWidth onClick={onContinue}>Continue</Button>
                {routineExercises.length > 0 && !routineSaved && (
                    <Button variant="secondary" fullWidth onClick={() => setSavingRoutine(true)}>Save as routine</Button>
                )}
                {!hasStats && <Button variant="secondary" fullWidth onClick={onViewProgress}>View progress</Button>}
            </div>

            <SaveRoutineDialog
                open={savingRoutine}
                initialName={workout.title}
                exercises={routineExercises}
                onClose={() => setSavingRoutine(false)}
                onSaved={() => setRoutineSaved(true)}
            />
        </div>
    )
}

export default WorkoutComplete
