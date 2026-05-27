// OneRepMax.jsx

// Imports
import { useState, useEffect } from 'react'

// Function Imports
import { formatWeight } from '../../utils/formatValues'

// Variable Imports
import { MUSCLE_GROUPS, MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils.js'

const OneRepMax = ({ workouts }) => {
    const [maxes, setMaxes] = useState([])
    const [expanded, setExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [search, setSearch] = useState("")
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All')

    useEffect(() => {
        if (!workouts || workouts.length === 0) {
            setMaxes([])
            return
        }

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

        const maxesArray = Object.entries(maxByExercise).map(([exerciseName, data]) => ({
            exerciseName,
            muscleGroup: data.muscleGroup,
            oneRepMax: Number(data.oneRepMax.toFixed(1))
        }))

        setMaxes(maxesArray)
    }, [workouts])

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
        <div onClick={() => {if (isMobile) setExpanded(!expanded)}} className={`flex flex-col text-[#EDF2F4] bg-[#8D99AE] p-6 rounded-2xl ${expanded || !isMobile ? 'h-auto' : 'h-[75px] overflow-y-hidden'}`} >
            <h2 className="text-[#EDF2F4] text-2xl font-semibold text-center">
                One Rep <span className="text-[#EF233C]">Maxes</span>
            </h2>

            <p className="text-center text-[#EDF2F4]/40 mb-8">
                1RM = Weight x ( 1 + ( Reps / 30 ) )
            </p>

            <div className="flex flex-row items-center w-full gap-3 mb-5">
                <input 
                    placeholder="Search Maxes..."
                    className="bg-[#2B2D42] text-[#EDF2F4] rounded-2xl w-full p-4 flex-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}    
                />

                <select
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-[#2B2D42] text-[#EDF2F4] p-4 rounded-2xl outline-none w-full flex-1"
                    value={selectedMuscleGroup}
                    onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                >
                    {MUSCLE_GROUPS.map((group) => (
                        <option key={group} value={group}>{group}</option>
                    ))}
                </select>
            </div>
            

            <div className="w-full space-y-3">
                {displayMaxes.map((max, index) => (
                    <div key={index + 1} className="rounded-2xl p-4 flex flex-row items-center justify-between transition hover:scale-102" style={{ backgroundColor: MUSCLE_GROUP_COLOURS[max.muscleGroup] }} >
                        <div className="flex flex-row items-center gap-4">
                            <h2 className="font-bold text-xl">{max.exerciseName}</h2>
                            <h2 className="text-[#EDF2F4]/60">{max.muscleGroup}</h2>
                        </div>
                        
                        <h2>{formatWeight(max.oneRepMax)}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OneRepMax