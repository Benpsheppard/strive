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
import GuestHeader from '../components/headers/GuestHeader.jsx'

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
                
                const exerciseMatch = workout.exercises?.some(exercise =>
                    exercise.name.toLowerCase().includes(lowerSearch)
                )

                return titleMatch || exerciseMatch
            })
        }

        switch (sortOption) {
            case 'newest':
                return filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            case 'oldest':
                return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            case 'title-asc':
                return filtered.sort((a, b) => a.title.localeCompare(b.title))
            case 'title-desc':
                return filtered.sort((a, b) => b.title.localeCompare(a.title))
            default:
                return filtered
        }
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
        <section className="bg-[#2B2D42] min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
            <Header /> 
            {user?.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}

            <div className="text-5xl md:text-6xl text-[#EDF2F4] font-semibold text-center p-4">
                <h1>Your Completed <span className="text-[#EF233C]">Workouts</span></h1>
            </div>

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
            <div className="workout-content w-full">
                {workouts.length > 0 ? 
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
                            <Link to='/new-workout'>
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