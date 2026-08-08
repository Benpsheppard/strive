// RadarGraph.jsx

// Imports
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, } from "recharts"

const RadarGraph = ({ workouts }) => {

    const lastWorkout = workouts.length > 0
        ? workouts.reduce((latest, w) => new Date(w.date) > new Date(latest.date) ? w : latest)
        : null

    const lastWorkoutStrengthPoints = lastWorkout.summary.totalStrivePoints.strength.reward
    const lastWorkoutVolumePoints = lastWorkout.summary.totalStrivePoints.volume.reward
    const lastWorkoutProgressionPoints = lastWorkout.summary.totalStrivePoints.progression.reward

    const averageReward = (workouts, field) => {
        const withReward = workouts.filter(w => {
            const reward = w.summary?.totalStrivePoints?.[field]?.reward
            return reward != null && reward !== 0
        })
        return withReward.length > 0
            ? Math.round(withReward.reduce((sum, w) => sum + w.summary.totalStrivePoints[field].reward, 0) / withReward.length)
            : 0
    }

    const averageStrengthPoints = averageReward(workouts, "strength")
    const averageVolumePoints = averageReward(workouts, "volume")
    const averageProgressionPoints = averageReward(workouts, "progression")

    const data = [
        { subject: "Strength", Last: lastWorkoutStrengthPoints, Average: averageStrengthPoints, fullMark: 150 },
        { subject: "Volume", Last: lastWorkoutVolumePoints, Average: averageVolumePoints, fullMark: 150 },
        { subject: "Progression", Last: lastWorkoutProgressionPoints, Average: averageProgressionPoints, fullMark: 150}
    ]

    return (
		<div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center text-xl w-full">
            <h2 className="text-[#EDF2F4] text-2xl font-semibold mb-4">
                Workout<span className="text-[#EF233C] font-bold"> Score</span>
			</h2>

            <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                        name="Last"
                        dataKey="Last"
                        stroke="#EF233C"
                        fill="#EF233C"
                        fillOpacity={0.5}
                    />
                    <Radar
                        name="Average"
                        dataKey="Average"
                        stroke="#EDF2F4"
                        fill="#EDF2F4"
                        fillOpacity={0.4}
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