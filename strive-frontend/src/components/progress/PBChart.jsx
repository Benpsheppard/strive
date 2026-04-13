// PBChart.jsx

// Imports
import { useState, useEffect } from 'react'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Function Imports
import { calculatePersonalBests } from '../../utils/pbDetection.js'
import { kgToLbs, getWeightUnit } from '../../utils/formatValues.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const MUSCLE_GROUPS = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Arms',
    'Legs',
    'Core',
    'Full body',
    'Other'
]

const PBChart = ({ workouts, useImperial }) => {
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All')
    const [expanded, setExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const exercisePBs = calculatePersonalBests(workouts)
    const weightUnit = getWeightUnit(useImperial)

    const filteredExercises = Object.entries(exercisePBs).filter(([, data]) => {
        if (selectedMuscleGroup === 'All') return true
        return data.muscleGroup === selectedMuscleGroup
    })

    const labels = filteredExercises.map(([name]) => name)
    const weights = filteredExercises.map(([, data]) =>
        useImperial ? kgToLbs(data.weight) : data.weight
    )
    const dates = filteredExercises.map(([, data]) => data.date)

    const chartData = {
        labels,
        datasets: [
            {
                label: `Personal Best (${weightUnit})`,
                data: weights,
                backgroundColor: '#EF233C'
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const index = context.dataIndex
                        const weight = context.parsed.y.toFixed(1)
                        const date = dates[index]
                        return ` ${weight} ${weightUnit} (on ${new Date(date).toLocaleDateString()})`
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#EDF2F4',
                    maxRotation: labels.length > 10 ? 90 : 45,
                    minRotation: labels.length > 10 ? 90 : 45,
                    display: labels.length <= 12
                },
                grid: { color: 'rgba(237, 242, 244, 0.3)' },
                title: {
                    display: labels.length > 12,
                    text: 'Exercise',
                    color: '#EDF2F4'
                }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#EDF2F4' },
                grid: { color: 'rgba(237, 242, 244, 0.3)' },
                title: {
                    display: true,
                    text: `Weight (${weightUnit})`,
                    color: '#EDF2F4'
                }
            }
        }
    }

    if (Object.keys(exercisePBs).length === 0) {
        return (
            <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10 text-center text-[#EDF2F4]">
                <p>No personal bests recorded yet</p>
            </div>
        )
    }

    return (
        <div
            onClick={() => { if (isMobile) setExpanded(!expanded) }}
            className={`bg-[#8D99AE] p-6 rounded-2xl ${expanded || !isMobile ? 'h-auto' : 'h-[75px] overflow-y-hidden'}`}
        >
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-8 text-center">
                Personal <span className="text-[#EF233C]">Bests</span>
            </h2>

            {/* Muscle Group Filter */}
            <select
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#2B2D42] text-[#EDF2F4] p-2 rounded-lg mb-6 outline-none"
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            >
                {MUSCLE_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                ))}
            </select>

            {/* Chart */}
            <div className="relative h-[300px] md:h-[400px]">
                {labels.length === 0 ? (
                    <div className="text-center text-[#EDF2F4] py-8">
                        <p>No weight exercises found for {selectedMuscleGroup}</p>
                    </div>
                ) : (
                    <Bar onClick={(e) => e.stopPropagation()} data={chartData} options={options} />
                )}
            </div>
        </div>
    )
}

export default PBChart