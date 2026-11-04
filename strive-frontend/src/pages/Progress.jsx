// Progress.jsx

// Imports
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaChartLine } from 'react-icons/fa'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PBChart from '../components/progress/PBChart.jsx'
import ExerciseProgressChart from '../components/progress/ExerciseProgressChart.jsx'
import MuscleGroupSplit from '../components/progress/MuscleGroupSplit.jsx'
import MonthCalendar from '../components/progress/MonthCalendar.jsx'
import MonthlyProgressCard from '../components/progress/MonthlyProgressCard.jsx'
import TotalProgressCard from '../components/progress/TotalProgressCard.jsx'
import OneRepMax from '../components/progress/OneRepMax.jsx'

const Progress = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading } = useSelector((state) => state.workout)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getWorkouts())
    }, [dispatch])

    if (isLoading && workouts.length === 0) return <Spinner />

    return (
        <div className="space-y-4">
            <PageTitle accent="summary">Progress</PageTitle>

            {workouts.length > 0 ? (
                <>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-4">
                            <MonthlyProgressCard workouts={workouts} />
                            <TotalProgressCard workouts={workouts} />
                        </div>
                        <MonthCalendar workouts={workouts} />
                    </div>

                    <div className="grid items-start gap-4 lg:grid-cols-2">
                        <PBChart workouts={workouts} useImperial={user.useImperial} />
                        <ExerciseProgressChart workouts={workouts} useImperial={user.useImperial} />
                    </div>

                    <MuscleGroupSplit workouts={workouts} useImperial={user.useImperial} />
                    <OneRepMax workouts={workouts} useImperial={user.useImperial} />
                </>
            ) : (
                <EmptyState
                    icon={FaChartLine}
                    title="No workouts yet"
                    message="Finish your first workout and your progress, personal bests and charts will appear here."
                    actionLabel="Start a workout"
                    actionTo="/"
                />
            )}
        </div>
    )
}

export default Progress
