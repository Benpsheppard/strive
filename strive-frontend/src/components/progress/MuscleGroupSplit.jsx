// MuscleGroupSplit.jsx

// Imports
import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

// Function Imports
import { kgToLbs, getWeightUnit, formatNumber } from '../../utils/formatValues.js'

// Variables Imports
import { MUSCLE_GROUP_COLOURS } from '../../utils/muscleGroupUtils.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const EXCLUDED_MUSCLE_GROUPS = ['Cardio']

const MuscleGroupSplit = ({ workouts, useImperial }) => {
    const [viewMode, setViewMode] = useState('exercises')
    const [expanded, setExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    const weightUnit = getWeightUnit(useImperial)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
    const backgroundColours = muscleGroupData.map((item) => MUSCLE_GROUP_COLOURS[item.group] || '#EDF2F4')

    const data = {
        labels,
        datasets: [
            {
                label: viewMode === 'exercises' ? 'Exercises' : viewMode === 'sets' ? 'Sets' : 'Total Weight',
                data: dataValues,
                backgroundColor: backgroundColours,
                borderColor: '#2B2D42',
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
                    color: '#EDF2F4',
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
            <div className="bg-[#8D99AE] p-6 rounded-2xl mt-10 text-center text-[#EDF2F4]">
                <p>No exercises found</p>
            </div>
        )
    }

    return (
        <div
            onClick={() => { if (isMobile) setExpanded(!expanded) }}
            className={`bg-[#8D99AE] p-6 rounded-2xl ${expanded || !isMobile ? 'h-auto' : 'h-[75px] overflow-y-hidden'}`}
        >
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-8 text-center">
                Muscle Group <span className="text-[#EF233C]">Split</span>
            </h2>

            {/* View Mode Toggles */}
            <div onClick={(e) => e.stopPropagation()} className="flex gap-2 mb-6 justify-center flex-wrap">
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'exercises' ? 'bg-[#EF233C] text-[#EDF2F4]' : 'bg-[#2B2D42] text-[#EDF2F4] hover:bg-opacity-80'}`}
                    onClick={() => setViewMode('exercises')}
                >
                    By Exercises
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'sets' ? 'bg-[#EF233C] text-[#EDF2F4]' : 'bg-[#2B2D42] text-[#EDF2F4] hover:bg-opacity-80'}`}
                    onClick={() => setViewMode('sets')}
                >
                    By Sets
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'weight' ? 'bg-[#EF233C] text-[#EDF2F4]' : 'bg-[#2B2D42] text-[#EDF2F4] hover:bg-opacity-80'}`}
                    onClick={() => setViewMode('weight')}
                >
                    By Weight
                </button>
            </div>

            {/* Chart */}
            <div className="relative h-[350px] md:h-[450px] flex items-center justify-center">
                <Pie onClick={(e) => e.stopPropagation()} data={data} options={options} />
            </div>

            {/* Stats Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                {muscleGroupData.map((item, index) => (
                    <div key={item.group} className="bg-[#2B2D42]/80 p-3 rounded-lg" style={{ borderLeft: `4px solid ${backgroundColours[index]}` }}>
                        <div className="text-[#EDF2F4] font-semibold text-sm">{item.group}</div>
                        <div className="text-[#EDF2F4] text-lg font-bold">{item.percentage}%</div>
                        <div className="text-[#EDF2F4] text-xs opacity-80">
                            {viewMode === 'weight'
                                ? `${formatNumber(item.displayCount, 1)} ${weightUnit}`
                                : `${formatNumber(item.count)} ${viewMode === 'exercises' ? 'exercises' : 'sets'}`
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MuscleGroupSplit