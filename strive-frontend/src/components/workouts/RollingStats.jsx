// RollingStats.jsx

// Imports
import { calculatePersonalBests } from '../../utils/pbDetection.js'

const RollingStats = ({ workouts, exercises }) => {
    const personalBests = calculatePersonalBests(workouts)

    let pbCount = 0

    const workoutStats = exercises.reduce((stats, exercise) => {
        const muscleGroup = exercise.muscleGroup || 'Other'

        const key = `${exercise.exerciseName}||${exercise.selectedEquipment}`
        const currentPB = personalBests[key]

        const hasNewPB = exercise.sets?.some((set) => {
            const weight = Number(set.weight) || 0

            if (!currentPB) {
                return weight > 0
            }

            return weight > currentPB.weight
        })

        if (hasNewPB) {
            pbCount += 1
        }

        exercise.sets?.forEach((set) => {
            const reps = Number(set.reps) || 0
            const weight = Number(set.weight) || 0
            const volume = weight * reps

            stats.sets += 1
            stats.reps += reps
            stats.totalWeight += volume

            if (!stats.muscleGroups[muscleGroup]) {
                stats.muscleGroups[muscleGroup] = 0
            }

            stats.muscleGroups[muscleGroup] += volume
        })

        return stats
    },
    {
        sets: 0,
        reps: 0,
        totalWeight: 0,
        muscleGroups: {},
    })

    return (
        <div className="p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">
            <h2 className="text-xl font-semibold text-[#EDF2F4] mb-4">
                Workout <span className="text-[#EF233C]">Statistics</span>
            </h2>

            {/* General stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-[#EDF2F4]/30 rounded-lg p-2">
                    <p className="text-3xl font-bold text-[#EF233C]">
                        {workoutStats.sets}
                    </p>
                    <p className="text-sm text-[#EDF2F4]/70">
                        Sets
                    </p>
                </div>

                <div className="bg-[#EDF2F4]/30 rounded-lg p-2">
                    <p className="text-3xl font-bold text-[#EF233C]">
                        {workoutStats.reps}
                    </p>
                    <p className="text-sm text-[#EDF2F4]/70">
                        Reps
                    </p>
                </div>

                <div className="bg-[#EDF2F4]/30 rounded-lg p-2">
                    <p className="text-3xl font-bold text-[#EF233C]">
                        {pbCount}
                    </p>
                    <p className="text-sm text-[#EDF2F4]/70">
                        PBs
                    </p>
                </div>
            </div>

            {/* Muscle group volume */}
            <div className="space-y-2">
                <h3 className="font-semibold text-[#EDF2F4]">
                    Volume
                </h3>

                {Object.entries(workoutStats.muscleGroups).map(
                    ([muscleGroup, volume]) => (
                        <div key={muscleGroup} className="flex justify-between items-center bg-[#EDF2F4]/30 rounded-lg px-4 py-2" >
                            <span className="text-[#2B2D42]">
                                {muscleGroup}
                            </span>

                            <span className="font-semibold text-[#2B2D42]">
                                {volume.toLocaleString()} kg
                            </span>
                        </div>
                    )
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-[#2B2D42]/30">
                    <span className="font-bold text-[#2B2D42]">
                        Total
                    </span>

                    <span className="font-bold text-[#2B2D42]">
                        {workoutStats.totalWeight.toLocaleString()} kg
                    </span>
                </div>
            </div>
        </div>
    )
}

export default RollingStats