// WorkoutDashboard.jsx

// Component Imports
import GamesSummary from "../games/GamesSummary"
import Calendar from "../progress/Calendar"
import WorkoutItem from "./WorkoutItem"
import MuscleGroupHeatmap from "../progress/MuscleGroupHeatmap"

const WorkoutDashBoard = ({ user, workouts, startWorkout }) => {
    const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null

    return (
        <section className="space-y-3 w-full max-w-2xl">
            <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>Welcome back, <span className="text-[#EF233C]">{user.isGuest ? 'Guest' : user.username}</span></h1>
            </div>

            {user?.isGuest && <GuestCard workouts={workouts} isMigrate={false} />}
            
            <div className='fade-in-card' style={{ animationDelay: '0.2s' }}>
                <GamesSummary user={user} />
            </div>

            <div className="card-theme fade-in-card p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-[#EDF2F4] text-xl text-center mb-3">Ready to train?</h2>
                <button onClick={startWorkout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 px-4 rounded-xl hover:bg-[#D90429]">
                    Start Workout
                </button>
            </div>

            <div className="fade-in-card" style={{ animationDelay: '0.6s' }}>
                <Calendar workouts={workouts} />
            </div>
            

            {lastWorkout && (
                <div className="fade-in-card" style={{ animationDelay: '0.8s' }}>
                    <WorkoutItem workout={lastWorkout} />
                </div>
            )}
            
            <div className="fade-in-card" style={{ animationDelay: '1.0s' }}>
                <MuscleGroupHeatmap workouts={workouts} />
            </div>
        </section>
    )
}

export default WorkoutDashBoard