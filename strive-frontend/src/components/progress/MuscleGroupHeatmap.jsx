// MuscleHeatmap.jsx

const MuscleGroupHeatmap = ({ workouts }) => {
    const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Other']

    // Get colour intensity based on count
    const getColour = (daysSince) => {
        if (daysSince === null || daysSince >= 5) return 'bg-[#2B2D42]/60 text-[#EDF2F4] opacity-40'
        if (daysSince === 0) return 'bg-[#EF233C] text-[#EDF2F4]'
        if (daysSince === 1) return 'bg-[#EF233C]/80 text-[#EDF2F4]'
        if (daysSince === 2) return 'bg-[#EF233C]/65 text-[#EDF2F4]'
        if (daysSince === 3) return 'bg-[#EF233C]/50 text-[#EDF2F4]'
        if (daysSince === 4) return 'bg-[#EF233C]/35 text-[#EDF2F4]'
        return 'bg-[#EF233C]/25 text-[#EDF2F4]'
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

    return (
        <div className="w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl px-6 py-4 mb-4">
            <p className="text-[#EDF2F4] font-semibold text-center mb-1">Muscle Groups</p>
            <p className="text-[#EDF2F4] text-xs text-center opacity-60 mb-4">Last Trained</p>

            <div className="grid grid-cols-3 gap-2">
                {MUSCLE_GROUPS.map((group) => {
                    const daysSince = getDaysSince(group)

                    return (
                        <div key={group} className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition ${getColour(daysSince)}`}>
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