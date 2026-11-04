// ExerciseProgressChart.jsx

// Imports
import { useState, useMemo, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from 'chart.js'
import { Line } from 'react-chartjs-2'

// Function Imports
import { getWeightUnit, kgToLbs } from '../../utils/formatValues'

// Variables Imports
import { MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils'
import { CHART } from '../../utils/chartTheme.js'
import CollapsibleCard from '../ui/CollapsibleCard.jsx'
import Select from '../ui/Select.jsx'
import Card from '../ui/Card.jsx'
import { useIsMobile } from '../../hooks/useMediaQuery.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const ExerciseProgressChart = ({ workouts, useImperial }) => {
    const isMobile = useIsMobile()
    const [selectedExercise, setSelectedExercise] = useState('')
    const [workoutLimit, setWorkoutLimit] = useState(10)

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
        return Array.from(seen.values()).sort((a, b) => a.key.localeCompare(b.key))
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

    const selectedColour = MUSCLE_GROUP_COLOURS[allExercises.find(e => e.key === selectedExercise)?.muscleGroup] || CHART.accent

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
                backgroundColor: CHART.text,
                borderColor: CHART.text,
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
                    color: CHART.text,
                    display: workoutLimit < 15
                },
                grid: { color: CHART.grid },
                title: {
                    display: workoutLimit >= 15,
                    text: 'Workout Date',
                    color: CHART.text
                }
            },
            y: {
                ticks: { color: CHART.text },
                grid: { color: CHART.grid },
                title: {
                    display: true,
                    text: `Weight (${weightUnit})`,
                    color: CHART.text
                }
            },
        },
        plugins: {
            legend: {
                labels: { color: CHART.text },
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
            <Card className="text-center text-muted">
                No weighted exercises logged yet. Your lifts will be charted here over time.
            </Card>
        )
    }

    return (
        <CollapsibleCard title="Exercise" accent="progress" summary="Track one lift over your recent workouts" defaultOpen={!isMobile}>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <Select label="Exercise" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                    {allExercises.map((ex) => (
                        <option key={ex.key} value={ex.key}>{ex.key}</option>
                    ))}
                </Select>

                <Select label="Show" value={workoutLimit} onChange={(e) => setWorkoutLimit(Number(e.target.value))}>
                    <option value={5}>Last 5 workouts</option>
                    <option value={10}>Last 10 workouts</option>
                    <option value={15}>Last 15 workouts</option>
                    <option value={20}>Last 20 workouts</option>
                    {!isMobile && (
                        <>
                            <option value={50}>Last 50 workouts</option>
                            <option value={100}>Last 100 workouts</option>
                        </>
                    )}
                </Select>
            </div>

            <div className="relative h-[300px] md:h-[400px]">
                {selectedExercise && exerciseData.length > 0 ? (
                    <Line data={data} options={options} aria-label={`Line chart of your max and average weight for ${selectedExercise}`} role="img" />
                ) : (
                    <p className="text-center text-muted">No data found for {selectedExercise}</p>
                )}
            </div>
        </CollapsibleCard>
    )
}

export default ExerciseProgressChart
