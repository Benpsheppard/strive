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

// Register Chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const ExerciseProgressChart = ({ workouts, useImperial }) => {
    const [selectedExercise, setSelectedExercise] = useState('')
    const [workoutLimit, setWorkoutLimit] = useState(10)
    const [expanded, setExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    // Extract all unique exercises
    const allExercises = useMemo(() => {
        const names = new Set()
        workouts.forEach((w) => w.exercises.forEach((ex) => names.add(ex.name)))
        return Array.from(names)
    }, [workouts])

    // Get the weight unit for labels
    const weightUnit = getWeightUnit(useImperial)

    // Filter data for the selected exercise
    const exerciseData = useMemo(() => {
        if (!selectedExercise) return []
        const dataPoints = []

        workouts.forEach((w) => {
            const found = w.exercises.find((ex) => ex.name === selectedExercise)
            if (found) {
                const weights = found.sets.map((s) => Number(s.weight) || 0)
                const maxWeight = Math.max(...weights)
                const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
                
                dataPoints.push({
                    date: new Date(w.createdAt).toLocaleDateString(),
                    maxWeight: useImperial ? kgToLbs(maxWeight) : maxWeight,
                    avgWeight: useImperial ? kgToLbs(avgWeight) : avgWeight,
                })
            }
        })

        return dataPoints
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-workoutLimit) // Keep only the last workoutLimit workouts
    }, [selectedExercise, workouts, useImperial, workoutLimit])

    useEffect(() => {
        if (allExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(allExercises[0])
        }
    }, [allExercises, selectedExercise])

    // Chart data
    const data = {
        labels: exerciseData.map((d) => d.date),
        datasets: [
            {
                label: `Personal Best (${weightUnit})`,
                data: exerciseData.map((d) => d.maxWeight),
                backgroundColor: '#EF233C',
                borderColor: '#EF233C',
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: `Average Weight (${weightUnit})`,
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
                    text: `Workout Date`,
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

    useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

    return (
        <div onClick={() => {if (isMobile) setExpanded(!expanded)}} className={`bg-[#8D99AE] p-6 rounded-2xl ${expanded || !isMobile ? 'h-auto' : 'h-[75px] overflow-y-hidden'}`}>
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-8 text-center">
                Exercise<span className="text-[#EF233C]"> Progress</span>
            </h2>

            {/* Dropdown Menu */}
            <select onClick={(e) => e.stopPropagation()} className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-2 outline-none" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                {allExercises.map((name) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>

            <select onClick={(e) => e.stopPropagation()} className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-6 outline-none" value={workoutLimit} onChange={(e) => setWorkoutLimit(Number(e.target.value))}>
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

            {/* Chart Area */}
            <div className="relative h-[300px] md:h-[400px]">
                {selectedExercise && exerciseData.length > 0 ? (
                    <Line onClick={(e) => e.stopPropagation()} data={data} options={options} />
                ) : (
                    <p className="text-center text-[#EDF2F4] opacity-70">
                        Select an exercise to view your progress
                    </p>
                )}
            </div>
        </div>
    )
}

// Export
export default ExerciseProgressChart