// WorkoutDashboard.jsx

// Component Imports
import GuestCard from "../guest/GuestCard"
import GamesSummary from "../games/GamesSummary"
import Calendar from "../progress/Calendar"
import WorkoutItem from "./WorkoutItem"
import MuscleGroupHeatmap from "../progress/MuscleGroupHeatmap"

const WorkoutDashBoard = ({ user, workouts, startWorkout }) => {
    const lastThreeWorkouts = workouts.length > 0 ? [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3) : []

    return (
        <section className="space-y-5 w-full">
            <div className="text-4xl md:text-6xl font-semibold text-[#EDF2F4] text-center p-4">
                <h1>Welcome back, <span className="text-[#EF233C]">{user.isGuest ? 'Guest' : user.username}</span></h1>
            </div>

            {user?.isGuest && <GuestCard workouts={workouts} isMigrate={false} />}
            
            <div className='fade-in-card' style={{ animationDelay: '0.2s' }}>
                <GamesSummary user={user} />
            </div>

            <div className="card-theme fade-in-card p-6 w-full mx-auto bg-[#8D99AE] rounded-2xl" style={{ animationDelay: '0.4s' }}>
                <h2 className="font-bold text-[#EDF2F4] text-3xl text-center mb-3">
                    Ready to <span className="text-[#EF233C]">train?</span>
                </h2>
                <button onClick={startWorkout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 px-4 rounded-xl hover:bg-[#D90429]">
                    Start Workout
                </button>
            </div>

            <div className="fade-in-card" style={{ animationDelay: '0.6s' }}>
                <Calendar workouts={workouts} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-5">
                <div className="fade-in-card flex flex-col items-center w-full space-y-5 p-2 bg-[#8D99AE] text-[#EDF2F4] rounded-2xl" style={{ animationDelay: '0.8s' }}>
                    <h1 className="text-xl p-2 font-bold">
                        Most Recent <span className="text-[#EF233C]">Workouts</span>
                    </h1>

                    {lastThreeWorkouts.length > 0 && (
                        lastThreeWorkouts.map((workout) => 
                            <div key={workout._id} className="w-full">
                                <WorkoutItem workout={workout} />
                            </div>
                        )
                    )}
                </div>

                <div className="fade-in-card" style={{ animationDelay: '1.0s' }}>
                    <MuscleGroupHeatmap workouts={workouts} />
                </div>
            </div>
        </section>
    )
}

export default WorkoutDashBoard