// PBChart.jsx

// Imports
import { useState, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Function Imports
import { calculatePersonalBests } from '../../utils/pbDetection.js'
import { kgToLbs, getWeightUnit } from '../../utils/formatValues.js'

// Variable Imports
import { MUSCLE_GROUPS, MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils.js'
import { CHART } from '../../utils/chartTheme.js'
import CollapsibleCard from '../ui/CollapsibleCard.jsx'
import Select from '../ui/Select.jsx'
import Card from '../ui/Card.jsx'
import { useIsMobile } from '../../hooks/useMediaQuery.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PBChart = ({ workouts, useImperial }) => {
    const isMobile = useIsMobile()
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All')

    const exercisePBs = useMemo(() => calculatePersonalBests(workouts), [workouts])
    const weightUnit = getWeightUnit(useImperial)

    const filteredExercises = Object.entries(exercisePBs).filter(([, data]) => {
        if (selectedMuscleGroup === 'All') return true
        return data.muscleGroup === selectedMuscleGroup
    })

    const labels = filteredExercises.map(([, data]) => `${data.name} (${data.equipment})`)
    const weights = filteredExercises.map(([, data]) =>
        useImperial ? kgToLbs(data.weight) : data.weight
    )
    const dates = filteredExercises.map(([, data]) => data.date)
    const colours = filteredExercises.map(([, data]) =>
        MUSCLE_GROUP_COLOURS[data.muscleGroup] || CHART.text
    )

    const chartData = {
        labels,
        datasets: [
            {
                label: `Personal Best (${weightUnit})`,
                data: weights,
                backgroundColor: colours
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
                    color: CHART.text,
                    maxRotation: labels.length > 10 ? 90 : 45,
                    minRotation: labels.length > 10 ? 90 : 45,
                    display: labels.length <= 12
                },
                grid: { color: CHART.grid },
                title: {
                    display: labels.length > 12,
                    text: 'Exercise',
                    color: CHART.text
                }
            },
            y: {
                beginAtZero: true,
                ticks: { color: CHART.text },
                grid: { color: CHART.grid },
                title: {
                    display: true,
                    text: `Weight (${weightUnit})`,
                    color: CHART.text
                }
            }
        }
    }

    if (Object.keys(exercisePBs).length === 0) {
        return (
            <Card className="text-center text-muted">
                No personal bests recorded yet. Log some weighted sets and they will appear here.
            </Card>
        )
    }

    return (
        <CollapsibleCard title="Personal" accent="bests" summary="Your heaviest lift for each exercise" defaultOpen={!isMobile}>
            <Select
                label="Muscle group"
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="mb-4"
            >
                {MUSCLE_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                ))}
            </Select>

            <div className="relative h-[300px] md:h-[400px]">
                {labels.length === 0 ? (
                    <p className="py-8 text-center text-muted">No weighted exercises found for {selectedMuscleGroup}</p>
                ) : (
                    <Bar data={chartData} options={options} aria-label="Bar chart of your personal best weight for each exercise" role="img" />
                )}
            </div>
        </CollapsibleCard>
    )
}

export default PBChart
