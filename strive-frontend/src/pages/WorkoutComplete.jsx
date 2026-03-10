// WorkoutComplete.jsx

// Imports
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaTrophy, FaMedal, FaStar, FaArrowUp, FaDumbbell } from 'react-icons/fa'
import { formatDuration, formatWeight } from '../utils/formatValues'

// Component Imports
import Header from "../components/headers/Header"

const WorkoutComplete = () => {
    const { state } = useLocation()
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    if (!state) {
        navigate('/')
        return null
    }

    const { workout, totalSP, pbs, quests, levelUp, duration, newExercises } = state
    const totalWeight = workout.exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((setTotal, set) => {
            return setTotal + (Number(set.weight) || 0) * (Number(set.reps) || 0)
        }, 0)
    }, 0)

    return (
        <section className="min-h-screen mt-0 md:mt-20 flex flex-col items-center px-4 pb-32">
			<Header />

            <div className="text-5xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>
                    Workout <span className="text-[#EF233C]">Completed!</span>
                </h1>
                <p className="text-[#EDF2F4]/40 text-lg">{workout.title}</p>
            </div>            

            <div className="w-full max-w-2xl space-y-4">

                {/* Level Up — show prominently if it happened */}
                {levelUp && (
                    <div className="bg-[#EF233C] rounded-2xl px-6 py-5 text-center shadow-lg animate-pulse">
                        <FaArrowUp className="text-[#EDF2F4] text-3xl mx-auto mb-2" />
                        <p className="text-[#EDF2F4] text-2xl font-bold">Level Up!</p>
                        <p className="text-[#EDF2F4] opacity-80 text-lg">You are now Level {levelUp}!</p>
                    </div>
                )}

                {/* Workout Stats */}
                <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                    <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                        <FaDumbbell className="text-[#EF233C]" /> Workout Stats
                    </h2>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">{formatDuration(duration)}</p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Duration</p>
                        </div>
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">{workout.exercises.length}</p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Exercises</p>
                        </div>
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">
                                {workout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)}
                            </p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Sets</p>
                        </div>
                        <div>
                            <p className="text-[#EF233C] text-2xl font-bold">{formatWeight(totalWeight, user.useImperial)}</p>
                            <p className="text-[#EDF2F4]/40 text-xs mt-1">Lifted</p>
                        </div>
                    </div>
                </div>

                {/* Strive Points Earned */}
                <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                    <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                        <FaStar className="text-[#EF233C]" /> Strive Points Earned
                    </h2>
                    <div className="text-center">
                        <p className="text-[#EF233C] text-5xl font-bold">+{totalSP}</p>
                        <p className="text-[#EDF2F4]/40 text-sm mt-1">SP</p>
                    </div>
                </div>

                {/* PBs */}
                {pbs.length > 0 && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                        <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaTrophy className="text-[#EF233C]" /> Personal Bests
                        </h2>
                        <div className="space-y-3">
                            {pbs.map((pb, index) => (
                                <div key={index} className="bg-[#2B2D42] rounded-xl px-4 py-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-[#EDF2F4] font-semibold">{pb.exerciseName}</p>
                                        <p className="text-[#EDF2F4]/40 text-sm">
                                            {pb.oldWeight} → <span className="text-[#EF233C] font-bold">{pb.newWeight}</span>
                                        </p>
                                    </div>
                                    <p className="text-[#EF233C] font-bold">+{pb.sp} SP</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Exercises */}
                {newExercises.length > 0 && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                        <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaDumbbell className="text-[#EF233C]" /> New Exercises
                        </h2>
                        <p className="text-[#EDF2F4] opacity-70 text-sm mb-3">
                            You completed {newExercises.length} new {newExercises.length === 1 ? 'exercise' : 'exercises'} for the first time!
                        </p>
                        <div className="space-y-2">
                            {newExercises.map((name, index) => (
                                <div key={index} className="bg-[#2B2D42] rounded-xl px-4 py-3">
                                    <p className="text-[#EDF2F4] font-semibold">{name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quests Completed */}
                {quests.length > 0 && (
                    <div className="bg-[#8D99AE] rounded-2xl px-6 py-5">
                        <h2 className="text-[#EDF2F4] font-semibold text-lg mb-4 flex items-center gap-2">
                            <FaMedal className="text-[#EF233C]" /> Quests Completed
                        </h2>
                        <div className="space-y-3">
                            {quests.map((quest, index) => (
                                <div key={index} className="bg-[#2B2D42]/40 rounded-xl px-4 py-3 flex justify-between items-center">
                                    <p className="text-[#EDF2F4] font-semibold">{quest.name}</p>
                                    <p className="text-[#EF233C] font-bold">+{quest.reward} SP</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                    <button onClick={() => navigate('/new-workout')} className="w-full bg-[#EF233C] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#D90429]">
                        Back to Home
                    </button>
                    <button onClick={() => navigate('/progress')} className="w-full bg-[#8D99AE] text-[#EDF2F4] py-3 rounded-xl font-semibold transition hover:bg-[#EF233C]">
                        View Progress
                    </button>
                </div>

            </div>
        </section>
    )
}

export default WorkoutComplete