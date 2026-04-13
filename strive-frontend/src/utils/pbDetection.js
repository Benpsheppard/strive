// pbDetection.js

export const calculatePersonalBests = (workouts) => {
    const exercisePBs = {}

    workouts.forEach((workout) => {
        const workoutDate = workout.date || workout.createdAt || 'Unknown date'

        workout.exercises.forEach((ex) => {
            const exerciseData = ex.exercise
            if (!exerciseData || typeof exerciseData !== 'object') {
				return
			}

            const name = exerciseData.name
            const muscleGroup = exerciseData.muscleGroup || 'Other'
            const trackingMode = exerciseData.trackingMode

            if (trackingMode !== 'weight_reps') {
				return
			}

            ex.sets.forEach((set) => {
                const weight = Number(set.weight) || 0
                if (!exercisePBs[name] || weight > exercisePBs[name].weight) {
                    exercisePBs[name] = { weight, date: workoutDate, muscleGroup }
                }
            })
        })
    })

    return exercisePBs
}

export const detectNewPBs = (newWorkout, existingWorkouts) => {
    const existingPBs = calculatePersonalBests(existingWorkouts)
    const newPBs = []

    newWorkout.exercises.forEach((ex) => {
        const exerciseData = ex.exercise
        if (!exerciseData || typeof exerciseData !== 'object') {
			return
		}
        if (exerciseData.trackingMode !== 'weight_reps') {
			return
		}

        const name = exerciseData.name
        const maxWeight = Math.max(0, ...ex.sets.map(s => Number(s.weight) || 0))
        if (maxWeight === 0) {
			return
		}

        const existingPB = existingPBs[name]
        if (!existingPB || maxWeight > existingPB.weight) {
            newPBs.push({
                exerciseName: name,
                newWeight: maxWeight,
                oldWeight: existingPB ? existingPB.weight : 0,
                isFirstTime: !existingPB
            })
        }
    })

    return newPBs
}