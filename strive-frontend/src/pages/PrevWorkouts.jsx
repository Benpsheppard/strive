// PrevWorkouts.jsx

// Imports
import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaHistory } from 'react-icons/fa'

// Feature Imports
import { getWorkouts } from '../features/workouts/workoutsSlice.js'

// Component Imports
import Spinner from '../components/spinners/Spinner.jsx'
import WorkoutItem from '../components/workouts/WorkoutItem.jsx'
import GuestCard from '../components/guest/GuestCard.jsx'
import PageTitle from '../components/ui/PageTitle.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'

const PAGE_SIZE = 20

const sp = (w) => w.summary?.totalStrivePoints?.total || 0

const SORTS = {
    newest: { label: 'Newest', compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
    oldest: { label: 'Oldest', compare: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
    'title-asc': { label: 'Title (A-Z)', compare: (a, b) => (a.title || '').localeCompare(b.title || '') },
    'title-desc': { label: 'Title (Z-A)', compare: (a, b) => (b.title || '').localeCompare(a.title || '') },
    'l-duration': { label: 'Longest first', compare: (a, b) => (b.duration || 0) - (a.duration || 0) },
    's-duration': { label: 'Shortest first', compare: (a, b) => (a.duration || 0) - (b.duration || 0) },
    weight: { label: 'Most volume', compare: (a, b) => (b.summary?.totalWeight || 0) - (a.summary?.totalWeight || 0) },
    reps: { label: 'Most reps', compare: (a, b) => (b.summary?.totalReps || 0) - (a.summary?.totalReps || 0) },
    sets: { label: 'Most sets', compare: (a, b) => (b.summary?.totalSets || 0) - (a.summary?.totalSets || 0) },
    sp: { label: 'Most Strive Points', compare: (a, b) => sp(b) - sp(a) }
}

const PrevWorkouts = () => {
    const { user } = useSelector((state) => state.auth)
    const { workouts, isLoading } = useSelector((state) => state.workout)
    const dispatch = useDispatch()

    const [sortOption, setSortOption] = useState('newest')
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    useEffect(() => {
        dispatch(getWorkouts())
    }, [dispatch])

    const results = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()

        const matching = term
            ? workouts.filter(workout =>
                workout.title?.toLowerCase().includes(term) ||
                workout.exercises?.some(ex => ex.exercise?.name?.toLowerCase().includes(term))
            )
            : [...workouts]

        return matching.sort(SORTS[sortOption].compare)
    }, [workouts, sortOption, searchTerm])

    if (isLoading && workouts.length === 0) return <Spinner />

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <PageTitle accent="workouts">Your completed</PageTitle>

            {user.isGuest && <GuestCard workouts={workouts} />}

            {workouts.length === 0 ? (
                <EmptyState
                    icon={FaHistory}
                    title="No workouts yet"
                    message="Your finished workouts will be listed here so you can look back on every set."
                    actionLabel="Start a workout"
                    actionTo="/"
                />
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                        <Input
                            label="Search"
                            type="search"
                            placeholder="Workout title or exercise"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(PAGE_SIZE) }}
                        />
                        <Select label="Sort by" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                        </Select>
                    </div>

                    <p className="text-sm text-muted" aria-live="polite">
                        {searchTerm.trim()
                            ? `${results.length} workout${results.length === 1 ? '' : 's'} match "${searchTerm.trim()}"`
                            : `${results.length} workout${results.length === 1 ? '' : 's'}`}
                    </p>

                    {results.length === 0 ? (
                        <p className="py-8 text-center text-muted">Nothing matches that search. Try a different word.</p>
                    ) : (
                        <div className="space-y-3">
                            {results.slice(0, visibleCount).map(workout => (
                                <WorkoutItem key={workout._id} workout={workout} />
                            ))}

                            {visibleCount < results.length && (
                                <Button variant="secondary" fullWidth onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>
                                    Show more ({results.length - visibleCount} left)
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default PrevWorkouts
