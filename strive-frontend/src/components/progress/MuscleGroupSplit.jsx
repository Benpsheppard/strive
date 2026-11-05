// MuscleGroupSplit.jsx

// Imports
import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'


// Function Imports
import { kgToLbs, getWeightUnit, formatNumber } from '../../utils/formatValues.js'

// Variables Imports
import { MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils.js'
import { useChartColours } from '../../utils/chartTheme.js'
import CollapsibleCard from '../ui/CollapsibleCard.jsx'
import Select from '../ui/Select.jsx'
import Card from '../ui/Card.jsx'
import { useIsMobile } from '../../hooks/useMediaQuery.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const EXCLUDED_MUSCLE_GROUPS = ['Cardio']

const MuscleGroupSplit = ({ workouts, useImperial }) => {
    const CHART = useChartColours()
    const isMobile = useIsMobile()
    const [viewMode, setViewMode] = useState('exercises')

    const weightUnit = getWeightUnit(useImperial)

    const muscleGroupCounts = {}

    workouts.forEach((workout) => {
        workout.exercises.forEach((ex) => {
            const exerciseData = ex.exercise
            if (!exerciseData || typeof exerciseData !== 'object') return

            const muscleGroup = exerciseData.muscleGroup
            if (!muscleGroup || EXCLUDED_MUSCLE_GROUPS.includes(muscleGroup)) return

            if (viewMode === 'exercises') {
                muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + 1
            } else if (viewMode === 'sets') {
                muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + (ex.sets?.length || 0)
            } else if (viewMode === 'weight') {
                const totalWeight = ex.sets?.reduce((sum, set) => {
                    return sum + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)
                }, 0) || 0
                muscleGroupCounts[muscleGroup] = (muscleGroupCounts[muscleGroup] || 0) + totalWeight
            }
        })
    })

    const total = Object.values(muscleGroupCounts).reduce((sum, count) => sum + count, 0)
    const muscleGroupData = Object.entries(muscleGroupCounts).map(([group, count]) => ({
        group,
        count,
        displayCount: (viewMode === 'weight' && useImperial) ? kgToLbs(count) : count,
        percentage: ((count / total) * 100).toFixed(1),
    })).sort((a, b) => b.count - a.count)

    const labels = muscleGroupData.map((item) => item.group)
    const dataValues = muscleGroupData.map((item) => item.count)
    const backgroundColours = muscleGroupData.map((item) => MUSCLE_GROUP_COLOURS[item.group] || CHART.text)

    const data = {
        labels,
        datasets: [
            {
                label: viewMode === 'exercises' ? 'Exercises' : viewMode === 'sets' ? 'Sets' : 'Total Weight',
                data: dataValues,
                backgroundColor: backgroundColours,
                borderColor: CHART.surface,
                borderWidth: 2,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: CHART.text,
                    padding: 15,
                    font: { size: 12 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const index = context.dataIndex
                        const count = muscleGroupData[index].displayCount
                        const percentage = muscleGroupData[index].percentage
                        const unit = viewMode === 'exercises' ? 'exercises' : viewMode === 'sets' ? 'sets' : weightUnit
                        const displayValue = viewMode === 'weight' ? formatNumber(count, 1) : formatNumber(count)
                        return ` ${displayValue} ${unit} (${percentage}%)`
                    },
                },
            },
        },
    }

    if (muscleGroupData.length === 0) {
        return (
            <Card className="text-center text-muted">No exercises logged yet.</Card>
        )
    }

    const modes = [['exercises', 'By exercises'], ['sets', 'By sets'], ['weight', 'By weight']]

    return (
        <CollapsibleCard title="Muscle group" accent="split" summary="How your training is spread across the body" defaultOpen={!isMobile}>
            <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Measure by">
                {modes.map(([mode, label]) => (
                    <button
                        key={mode}
                        type="button"
                        aria-pressed={viewMode === mode}
                        onClick={() => setViewMode(mode)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${viewMode === mode ? 'border-accent bg-accent text-white' : 'border-line bg-bg text-muted hover:text-fg'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="relative flex h-[350px] items-center justify-center md:h-[450px]">
                <Pie data={data} options={options} aria-label="Pie chart of your training split by muscle group" role="img" />
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {muscleGroupData.map((item, index) => (
                    <li key={item.group} className="rounded-lg bg-bg/60 p-3" style={{ borderLeft: `4px solid ${backgroundColours[index]}` }}>
                        <div className="text-sm font-semibold text-fg">{item.group}</div>
                        <div className="text-lg font-bold text-fg">{item.percentage}%</div>
                        <div className="text-xs text-muted">
                            {viewMode === 'weight'
                                ? `${formatNumber(item.displayCount, 1)} ${weightUnit}`
                                : `${formatNumber(item.count)} ${viewMode === 'exercises' ? 'exercises' : 'sets'}`
                            }
                        </div>
                    </li>
                ))}
            </ul>
        </CollapsibleCard>
    )
}

export default MuscleGroupSplit
