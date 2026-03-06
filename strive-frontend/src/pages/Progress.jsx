// Progress.jsx

// Imports
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'

// Function Imports
import { getWorkouts, reset } from '../features/workouts/workoutsSlice.js'
import { formatWeight, formatDuration, formatNumber } from '../utils/formatValues.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import PBChart from '../components/progress/PBChart.jsx'
import ProgressCard from '../components/progress/ProgressCard.jsx'
import CondensedProgressCard from '../components/progress/CondensedProgressCard.jsx'
import ExerciseProgressChart from '../components/progress/ExerciseProgressChart.jsx'
import MuscleGroupSplit from '../components/progress/MuscleGroupSplit.jsx'
import GuestHeader from '../components/headers/GuestHeader.jsx'

const Progress = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading, isError, message } = useSelector((state) => state.workout)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (isError) {
            console.log(message)
        }

        if (!user){
            navigate('/login')
            return
        }

        dispatch(getWorkouts())

        return () => {
            dispatch(reset())
        }

    }, [user, isError, message, navigate, dispatch])

    if(isLoading || !user){
        return (
            <Spinner />
        )
    }

    // Calculate stats
    const totalWorkouts = workouts.length
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)

    let totalWeight = 0
    let totalReps = 0
    let totalSets = 0
    let totalExercises = 0
    let heaviestLift = 0

    workouts.forEach((w) => {
        w.exercises.forEach((ex) => {
            totalExercises++ // count exercises

            ex.sets.forEach((set) => {
                const weight = Number(set.weight) || 0
                const reps = Number(set.reps) || 0

                totalWeight += weight * reps
                totalReps += reps
                totalSets++

                if (weight > heaviestLift) {
                    heaviestLift = weight
                }
            })
        })
    })

    return (
        <section className="bg-[#2B2D42] min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">            
            <Header />
            {user.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}

            <h1 className="text-5xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                Progress <span className="text-[#EF233C]">Summary</span>
            </h1>
            {workouts.length > 0 ? (
                <div className='w-full'>
                    {/* Summary grid */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <ProgressCard title="Total Workouts" value={formatNumber(totalWorkouts)} />
                        <ProgressCard title="Total Exercises" value={formatNumber(totalExercises)} />
                        <ProgressCard title="Total Duration" value={formatDuration(totalDuration || 0)} />                            
                        <ProgressCard title="Total Sets" value={formatNumber(totalSets)} />
                        <ProgressCard title="Total Weight Lifted" value={formatWeight(totalWeight, user.useImperial)} />
                        <ProgressCard title="Total Reps" value={formatNumber(totalReps)} />
                    </div>

                    {/* Mobile Summary card */}
                    <CondensedProgressCard
                        totalWorkouts={totalWorkouts}
                        totalExercises={totalExercises}
                        totalDuration={totalDuration}
                        totalSets={totalSets}
                        totalWeight={totalWeight}
                        totalReps={totalReps}
                    />

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PBChart workouts={workouts} useImperial={user.useImperial}/>
                        <ExerciseProgressChart workouts={workouts} useImperial={user.useImperial}/>
                    </div>

                    <MuscleGroupSplit workouts={workouts} useImperial={user.useImperial}/>


                </div>
            ) : (
                <div className="text-[#EDF2F4] text-xl text-center mt-10">
                    <h3>You have not completed any workouts!</h3>
                    <button className="rounded-lg bg-[#EF233C] px-4 py-2 mt-10 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                        <Link to='/new-workout'>
                            New Workout 
                        </Link>
                    </button>
                </div>
            )}
        </section>
    )
}

// Export
export default Progress