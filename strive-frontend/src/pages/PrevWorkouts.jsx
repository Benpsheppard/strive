// PrevWorkouts.jsx

// Imports 
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useMemo } from 'react'

// Function Imports
import { getWorkouts, reset } from '../features/workouts/workoutsSlice.js'

// Component Imports
import Header from '../components/headers/Header.jsx'
import WorkoutItem from '../components/workouts/WorkoutItem.jsx'
import Spinner from '../components/spinners/Spinner.jsx'
import GuestCard from '../components/guest/GuestCard.jsx'

// PrevWorkouts
const PrevWorkouts = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading, isError, message } = useSelector((state) => state.workout)

    const [sortOption, setSortOption] = useState('newest')
    const [searchTerm, setSearchTerm] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const filteredAndSortedWorkouts = useMemo(() => {
        let filtered = [...workouts]

        if (searchTerm.trim() !== '') {
            const lowerSearch = searchTerm.toLowerCase()

            filtered = filtered.filter(workout => {
                const titleMatch = workout.title 
                    ?.toLowerCase()
                    .includes(lowerSearch)
                
                const exerciseMatch = workout.exercises?.some(ex =>
                    ex.exercise.name.toLowerCase().includes(lowerSearch)
                )

                return titleMatch || exerciseMatch
            })
        }

        switch (sortOption) {
            case 'newest':
                filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                break
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                break
            case 'title-asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title))
                break
            case 'title-desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title))
                break
            case 'l-duration':
                filtered.sort((a, b) => b.duration - a.duration)
                break
            case 's-duration':
                filtered.sort((a, b) => a.duration - b.duration)
                break
            case 'weight':
                filtered.sort( (a, b) => (b.summary?.totalWeight || 0) - (a.summary?.totalWeight || 0) )
                break
            case 'reps':
                filtered.sort( (a, b) => (b.summary?.totalReps || 0) - (a.summary?.totalReps || 0) )
                break
            case 'sets':
                filtered.sort( (a, b) => (b.summary?.totalSets || 0) - (a.summary?.totalSets || 0) )
                break
            case 'sp':
                filtered.sort( (a, b) => (b.summary?.totalStrivePoints || 0) - (a.summary?.totalStrivePoints || 0) )
                break
            default:
                break
        }

        return filtered.slice(0, 25)
    }, [workouts, sortOption, searchTerm])

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

    if(isLoading){
        return (
            <Spinner />
        )
    }

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
            <Header /> 

            <div className="text-4xl md:text-6xl text-[#EDF2F4] font-semibold text-center p-4">
                <h1>Your Completed <span className="text-[#EF233C]">Workouts</span></h1>
            </div>

            {/* Guest Card */}
            {user?.isGuest && 
                <GuestCard workouts={workouts} isMigrate={false} />
            }

            {/* Filter + Search */}
            <div className="text-[#EDF2F4] w-full max-w-2xl flex flex-col md:flex-row gap-4 m-4">

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by workout title or exercise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#8D99AE] flex-1 rounded-lg px-4 py-2 font-semibold border border-transparent focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                />

                {/* Sort Dropdown */}
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-[#8D99AE] rounded-lg px-4 py-2 font-semibold border border-transparent focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title-asc">Title (A–Z)</option>
                    <option value="title-desc">Title (Z–A)</option>
                    <option value="l-duration">Longest Duration</option>
                    <option value="s-duration">Shortest Duration</option>
                    <option value="weight">Weight</option>
                    <option value="reps">Reps</option>
                    <option value="sets">Sets</option>
                    <option value="sp">Strive Points</option>
                </select>
            </div>

            <p className='bg-[#8D99AE]/40 text-[#EDF2F4]/40 w-full max-w-2xl rounded-lg px-4 py-2 mb-12 font-semibold'>
                {searchTerm
                    ? `${filteredAndSortedWorkouts.length} workout${
                        filteredAndSortedWorkouts.length !== 1 ? 's' : ''
                    } match "${searchTerm}"`
                    : `${filteredAndSortedWorkouts.length} total workout${
                        filteredAndSortedWorkouts.length !== 1 ? 's' : ''
                    }`
                }
            </p>

            {/* Workout Display */}
            <div className="workout-content w-full space-y-3">
                {filteredAndSortedWorkouts.length > 0 ? 
                (
                    <>
                        {filteredAndSortedWorkouts.map((wo) => (
                            <WorkoutItem key={wo._id} workout={wo} />
                        ))}
                    </>
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
            </div>
        </section>
    )
}

// Export PrevWorkouts
export default PrevWorkouts