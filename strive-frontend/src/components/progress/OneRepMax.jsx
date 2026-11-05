// OneRepMax.jsx

// Imports
import { useState, useMemo } from 'react'

// Function Imports
import { formatWeight } from '../../utils/formatValues'

// Variable Imports
import { MUSCLE_GROUPS, MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils.js'
import CollapsibleCard from '../ui/CollapsibleCard.jsx'
import Select from '../ui/Select.jsx'
import Card from '../ui/Card.jsx'
import { useIsMobile } from '../../hooks/useMediaQuery.js'
import Input from '../ui/Input.jsx'

const OneRepMax = ({ workouts, useImperial }) => {
    const isMobile = useIsMobile()
        const [search, setSearch] = useState("")
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All')

    const maxes = useMemo(() => {
        if (!workouts || workouts.length === 0) return []

        const maxByExercise = workouts.reduce((acc, workout) => {
            workout.exercises?.forEach((exercise) => {
                const exerciseName = exercise.exercise?.name || exercise.name
                const muscleGroup = exercise.exercise?.muscleGroup
                if (!exerciseName) return

                exercise.sets?.forEach((set) => {
                    const weight = Number(set.weight)
                    const reps = Number(set.reps)

                    if (!weight || !reps) return

                    const oneRepMax = weight * (1 + reps / 30)
                    
                    if (!acc[exerciseName]) {
                        acc[exerciseName] = {
                            oneRepMax: 0,
                            muscleGroup
                        }
                    }

                    if (oneRepMax > acc[exerciseName].oneRepMax) {
                        acc[exerciseName].oneRepMax = oneRepMax
                    }
                })
            })
            return acc
        }, {})

        return Object.entries(maxByExercise).map(([exerciseName, data]) => ({
            exerciseName,
            muscleGroup: data.muscleGroup,
            oneRepMax: Number(data.oneRepMax.toFixed(1))
        }))
    }, [workouts])

    const displayMaxes = maxes
        .filter(
            max => max.exerciseName.toLowerCase().includes(search.toLowerCase())
        )
        .filter(max => {
            if (selectedMuscleGroup !== 'All') {
                return max.muscleGroup === selectedMuscleGroup
            }

            return true
        })

    return (
        <CollapsibleCard title="One rep" accent="maxes" summary="Estimated heaviest single rep: weight × (1 + reps ÷ 30)" defaultOpen={!isMobile}>
            <div className="mb-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
                <Input
                    label="Search"
                    placeholder="Search exercises"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Select label="Muscle group" value={selectedMuscleGroup} onChange={(e) => setSelectedMuscleGroup(e.target.value)}>
                    {MUSCLE_GROUPS.map((group) => (
                        <option key={group} value={group}>{group}</option>
                    ))}
                </Select>
            </div>

            {displayMaxes.length === 0 ? (
                <p className="py-4 text-center text-muted">No weighted exercises match.</p>
            ) : (
                <ul className="space-y-2">
                    {displayMaxes.map((max) => (
                        <li
                            key={`${max.exerciseName}-${max.muscleGroup}`}
                            className="flex items-center justify-between gap-3 rounded-xl bg-bg/60 p-3"
                            style={{ borderLeft: `4px solid ${MUSCLE_GROUP_COLOURS[max.muscleGroup] || '#8d99ae'}` }}
                        >
                            <div>
                                <p className="font-semibold text-fg">{max.exerciseName}</p>
                                <p className="text-sm text-muted">{max.muscleGroup}</p>
                            </div>
                            <p className="font-bold text-fg">{formatWeight(max.oneRepMax, useImperial)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </CollapsibleCard>
    )
}

export default OneRepMax
