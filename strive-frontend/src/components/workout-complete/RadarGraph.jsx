// RadarGraph.jsx
// Compares this workout's strength, volume and progression scores with your last workout and average

import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { FaDumbbell } from 'react-icons/fa'
import Card, { CardTitle } from '../ui/Card.jsx'
import { CHART } from '../../utils/chartTheme.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// Fields
const FIELDS = ['strength', 'volume', 'progression']
const LABELS = ['Strength SP', 'Volume SP', 'Progression SP']

// Safely read a reward value from a workout
const getReward = (w, field) => w?.summary?.totalStrivePoints?.[field]?.reward ?? 0

// Average of non-zero rewards for a given field
const averageReward = (workouts, field) => {
    const withReward = workouts.filter(w => getReward(w, field) !== 0)
    return withReward.length > 0
        ? Math.round(withReward.reduce((sum, w) => sum + getReward(w, field), 0) / withReward.length)
        : 0
}

const RadarGraph = ({ workouts = [], workout = null }) => {
    // Exclude the current workout (if it's already been saved into `workouts`)
    // so "Last" always refers to the workout before the current one.
    const previousWorkouts = workout?._id
        ? workouts.filter(w => w._id !== workout._id)
        : workouts

    const lastWorkout = previousWorkouts.length > 0
        ? previousWorkouts.reduce((latest, w) =>
            new Date(w.date) > new Date(latest.date) ? w : latest
        )
        : null

    const series = {
        Average: FIELDS.map(field => averageReward(previousWorkouts, field)),
        Last: FIELDS.map(field => getReward(lastWorkout, field)),
        Current: FIELDS.map(field => getReward(workout, field))
    }

    const dataset = (label, colour, fillOpacity) => ({
        label,
        data: series[label],
        borderColor: colour,
        backgroundColor: `${colour}${fillOpacity}`,
        pointBackgroundColor: colour,
        borderWidth: 2
    })

    const data = {
        labels: LABELS,
        datasets: [
            dataset('Average', '#8d99ae', '33'),
            dataset('Last', '#edf2f4', '40'),
            dataset('Current', CHART.accent, '80')
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                min: 0,
                max: 150,
                ticks: { color: CHART.muted, backdropColor: 'transparent', stepSize: 50 },
                grid: { color: CHART.grid },
                angleLines: { color: CHART.grid },
                pointLabels: { color: CHART.text, font: { size: 13 } }
            }
        },
        plugins: {
            legend: { labels: { color: CHART.text } }
        }
    }

    return (
        <Card as="section" aria-labelledby="score-title" className="fade-in-card">
            <CardTitle id="score-title" className="mb-3 flex items-center gap-2">
                <FaDumbbell aria-hidden="true" className="text-accent-fg" /> Workout score
            </CardTitle>

            <div className="h-80">
                <Radar data={data} options={options} aria-label="Radar chart comparing this workout's strength, volume and progression scores with your last workout and average" role="img" />
            </div>

            {/* Text version of the chart for screen readers */}
            <ul className="sr-only">
                {LABELS.map((label, i) => (
                    <li key={label}>
                        {label}: this workout {series.Current[i]}, last workout {series.Last[i]}, average {series.Average[i]}
                    </li>
                ))}
            </ul>
        </Card>
    )
}

export default RadarGraph
