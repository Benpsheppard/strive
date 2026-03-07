// MuscleHeatmap.jsx

const MuscleGroupHeatmap = ({ workouts }) => {
    const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Other']

    // Get workouts from the last 7 days
    const getRecentWorkouts = () => {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return workouts.filter(w => new Date(w.createdAt) >= sevenDaysAgo)
    }

    // Count how many times each muscle group appears in recent workouts
    const getMuscleGroupCounts = () => {
        const recentWorkouts = getRecentWorkouts()
        const counts = {}

        MUSCLE_GROUPS.forEach(group => counts[group] = 0)

        recentWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const group = exercise.musclegroup
                if (group && counts[group] !== undefined) {
                    counts[group]++
                }
            })
        })

        return counts
    }

    // Get colour intensity based on count
    const getColour = (count) => {
        if (count === 0) return 'bg-[#2B2D42]/60 text-[#EDF2F4] opacity-40'
        if (count === 1) return 'bg-[#EF233C]/30 text-[#EDF2F4]'
        if (count === 2) return 'bg-[#EF233C]/55 text-[#EDF2F4]'
        if (count === 3) return 'bg-[#EF233C]/75 text-[#EDF2F4]'
        return 'bg-[#EF233C] text-[#EDF2F4]' // 4+ times
    }

    // Days since a muscle group was last trained
    const getDaysSince = (muscleGroup) => {
        const sorted = [...workouts]
            .filter(w => w.exercises.some(e => e.musclegroup === muscleGroup))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        if (sorted.length === 0) return null

        const lastDate = new Date(sorted[0].createdAt)
        const today = new Date()
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const counts = getMuscleGroupCounts()

    return (
        <div className="w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl px-6 py-4 mb-4">
            <p className="text-[#EDF2F4] font-semibold text-center mb-1">Muscle Groups</p>
            <p className="text-[#EDF2F4] text-xs text-center opacity-60 mb-4">Last 7 days</p>

            <div className="grid grid-cols-4 gap-2">
                {MUSCLE_GROUPS.map((group) => {
                    const count = counts[group]
                    const daysSince = getDaysSince(group)

                    return (
                        <div key={group} className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition ${getColour(count)}`}>
                            <span className="text-xs font-semibold">{group}</span>
                            {daysSince !== null ? (
                                <span className="text-xs opacity-75 mt-1">
                                    {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                                </span>
                            ) : (
                                <span className="text-xs opacity-50 mt-1">—</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MuscleGroupHeatmap