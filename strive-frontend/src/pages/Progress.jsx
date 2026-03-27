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
import ProgressCard from '../components/progress/TotalProgressCard.jsx'
import CondensedProgressCard from '../components/progress/TotalProgressCard.jsx'
import ExerciseProgressChart from '../components/progress/ExerciseProgressChart.jsx'
import MuscleGroupSplit from '../components/progress/MuscleGroupSplit.jsx'
import MonthCalendar from '../components/progress/MonthCalendar.jsx'
import MonthlyProgressCard from '../components/progress/MonthlyProgressCard.jsx'
import TotalProgressCard from '../components/progress/TotalProgressCard.jsx'

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

    

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">            
            <Header />

            <h1 className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                Progress <span className="text-[#EF233C]">Summary</span>
            </h1>
            {workouts.length > 0 ? (
                <div className='w-full space-y-6'> 
                    {/* Summary Cards */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 text-xl'>
                        <MonthlyProgressCard workouts={workouts} />
                        <TotalProgressCard workouts={workouts}/>
                    </div>                   

                    {/* Monthly Consistency Calendar */}
                    <MonthCalendar workouts={workouts} />

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
                        <Link to='/'>
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