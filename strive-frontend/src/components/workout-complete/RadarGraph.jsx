// RadarGraph.jsx

// Imports
import { FaDumbbell } from 'react-icons/fa'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, } from "recharts"

// Fields
const FIELDS = ["strength", "volume", "progression"]

// Safely read a reward value from a workout
const getReward = (w, field) => w?.summary?.totalStrivePoints?.[field]?.reward ?? 0

// Average of non-zero rewards for a given field
const averageReward = (workouts, field) => {
    const withReward = workouts.filter(w => {
        const reward = getReward(w, field)
        return reward !== 0
    })
    return withReward.length > 0
        ? Math.round(
              withReward.reduce((sum, w) => sum + getReward(w, field), 0) / withReward.length
          )
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

    const last = {}
    const average = {}
    const current = {}

    FIELDS.forEach(field => {
        last[field] = getReward(lastWorkout, field)
        average[field] = averageReward(previousWorkouts, field)
        current[field] = getReward(workout, field)
    })

    const data = [
        {
            subject: "Strength SP",
            Current: current.strength,
            Last: last.strength,
            Average: average.strength,
            fullMark: 150,
        },
        {
            subject: "Volume SP",
            Current: current.volume,
            Last: last.volume,
            Average: average.volume,
            fullMark: 150,
        },
        {
            subject: "Progression SP",
            Current: current.progression,
            Last: last.progression,
            Average: average.progression,
            fullMark: 150,
        },
    ]

    return (
        <div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center text-xl w-full">
            <h2 className="flex text-[#EDF2F4] text-lg font-semibold mb-4 items-center gap-2 text-left">
                <FaDumbbell className="text-[#EF233C]" /> Workout Score
            </h2>

            <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 12, fill: "#EDF2F4" }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 150]}
                            tick={{ fill: "#EDF2F4", fontSize: 12 }}
                        />

                        {/* Average (back layer) */}
                        <Radar
                            name="Average"
                            dataKey="Average"
                            stroke="#2B2D42"
                            fill="#2B2D42"
                            fillOpacity={0.25}
                        />

                        {/* Last workout (middle layer) */}
                        <Radar
                            name="Last"
                            dataKey="Last"
                            stroke="#EDF2F4"
                            fill="#EDF2F4"
                            fillOpacity={0.35}
                        />

                        {/* Current workout (front layer) */}
                        <Radar
                            name="Current"
                            dataKey="Current"
                            stroke="#EF233C"
                            fill="#EF233C"
                            fillOpacity={0.5}
                            animationEasing="ease-out"
                            animationDuration={800}
                        />

                        <Legend />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default RadarGraph