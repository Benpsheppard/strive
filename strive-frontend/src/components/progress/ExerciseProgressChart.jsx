// ExerciseProgressChart.jsx

// Imports
import { useState, useMemo, useEffect } from 'react'
import { 
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Function Imports
import { getWeightUnit, kgToLbs } from '../../utils/formatValues'

// Variables Imports
import { MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const ExerciseProgressChart = ({ workouts, useImperial }) => {
    const [selectedExercise, setSelectedExercise] = useState('')
    const [workoutLimit, setWorkoutLimit] = useState(10)
    const [expanded, setExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    const weightUnit = getWeightUnit(useImperial)

    // Extract unique weight_reps exercises only
    const allExercises = useMemo(() => {
        const seen = new Map()
        workouts.forEach((w) => {
            w.exercises.forEach((ex) => {
                const exerciseData = ex.exercise

                if (!exerciseData || typeof exerciseData !== 'object') return
                if (exerciseData.trackingMode !== 'weight_reps') return
                
                const key = `${exerciseData.name} (${ex.selectedEquipment})`
                if (!seen.has(key)) {
                    seen.set(key, {
                        key,
                        name: exerciseData.name,
                        selectedEquipment: ex.selectedEquipment,
                        muscleGroup: exerciseData.muscleGroup
                    })
                }
            })
        })
        return Array.from(seen.values())
    }, [workouts])

    // Auto-select first exercise
    useEffect(() => {
        if (allExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(allExercises[0].key)
        }
    }, [allExercises, selectedExercise])

    // Build chart data points for selected exercise
    const exerciseData = useMemo(() => {
        if (!selectedExercise) return []
        const selected = allExercises.find(e => e.key === selectedExercise)
        if (!selected) return []

        const dataPoints = []

        workouts.forEach((w) => {
            const found = w.exercises.find((ex) =>
                ex.exercise?.name === selected.name && ex.selectedEquipment === selected.selectedEquipment
            )
            if (!found) return

            const weights = found.sets.map((s) => Number(s.weight) || 0).filter(w => w > 0)
            if (weights.length === 0) return

            const maxWeight = Math.max(...weights)
            const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length

            dataPoints.push({
                rawDate: new Date(w.createdAt),
                date: new Date(w.createdAt).toLocaleDateString(),
                maxWeight: useImperial ? kgToLbs(maxWeight) : maxWeight,
                avgWeight: useImperial ? kgToLbs(avgWeight) : avgWeight,
            })
        })

        return dataPoints
            .sort((a, b) => a.rawDate - b.rawDate)
            .slice(-workoutLimit)
    }, [selectedExercise, allExercises, workouts, useImperial, workoutLimit])

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const selectedColour = MUSCLE_GROUP_COLOURS[allExercises.find(e => e.key === selectedExercise)?.muscleGroup] || '#EF233C'

    const data = {
        labels: exerciseData.map((d) => d.date),
        datasets: [
            {
                label: `Max Weight (${weightUnit})`,
                data: exerciseData.map((d) => d.maxWeight),
                backgroundColor: selectedColour,
                borderColor: selectedColour,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: `Avg Weight (${weightUnit})`,
                data: exerciseData.map((d) => d.avgWeight),
                backgroundColor: '#EDF2F4',
                borderColor: '#EDF2F4',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: '#EDF2F4',
                    display: workoutLimit < 15
                },
                grid: { color: 'rgba(255,255,255,0.1)' },
                title: {
                    display: workoutLimit >= 15,
                    text: 'Workout Date',
                    color: '#EDF2F4'
                }
            },
            y: {
                ticks: { color: '#EDF2F4' },
                grid: { color: 'rgba(255,255,255,0.1)' },
                title: {
                    display: true,
                    text: `Weight (${weightUnit})`,
                    color: '#EDF2F4'
                }
            },
        },
        plugins: {
            legend: {
                labels: { color: '#EDF2F4' },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(1)} ${weightUnit}`,
                },
            },
        },
    }

    if (allExercises.length === 0) {
        return (
            <div className="bg-[#8D99AE] p-6 rounded-2xl text-center text-[#EDF2F4]">
                <p>No weight exercises recorded yet</p>
            </div>
        )
    }

    return (
        <div
            onClick={() => { if (isMobile) setExpanded(!expanded) }}
            className={`bg-[#8D99AE] p-6 rounded-2xl ${expanded || !isMobile ? 'h-auto' : 'h-[75px] overflow-y-hidden'}`}
        >
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-8 text-center">
                Exercise <span className="text-[#EF233C]">Progress</span>
            </h2>

            {/* Exercise Dropdown */}
            <select
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-2 outline-none"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
            >
                {allExercises.map((ex) => (
                    <option key={ex.key} value={ex.key}>{ex.key}</option>
                ))}
            </select>

            {/* Workout Limit Dropdown */}
            <select
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-6 outline-none"
                value={workoutLimit}
                onChange={(e) => setWorkoutLimit(Number(e.target.value))}
            >
                <option value={5}>Last 5 Workouts</option>
                <option value={10}>Last 10 Workouts</option>
                <option value={15}>Last 15 Workouts</option>
                <option value={20}>Last 20 Workouts</option>
                {!isMobile && (
                    <>
                        <option value={50}>Last 50 Workouts</option>
                        <option value={100}>Last 100 Workouts</option>
                    </>
                )}
            </select>

            {/* Chart */}
            <div className="relative h-[300px] md:h-[400px]">
                {selectedExercise && exerciseData.length > 0 ? (
                    <Line onClick={(e) => e.stopPropagation()} data={data} options={options} />
                ) : (
                    <p className="text-center text-[#EDF2F4] opacity-70">
                        No data found for {selectedExercise}
                    </p>
                )}
            </div>
        </div>
    )
}

export default ExerciseProgressChart