// Progress.jsx
// File to hold Progress page layout and functionality

// Imports
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getWorkouts, reset } from '../features/workouts/workoutsSlice.js';
import { formatWeight } from '../utils/weightUnits.js';
import { useOnlineStatus } from '../hooks/onlineStatus.js';

import Header from '../components/Header.jsx';
import Spinner from '../components/Spinner.jsx';
import PBChart from '../components/PBChart.jsx';
import ProgressCard from '../components/ProgressCard.jsx';
import MobileProgressCard from '../components/CondensedProgressCard.jsx';
import ExerciseProgressChart from '../components/ExerciseProgressChart.jsx';
import MuscleGroupSplit from '../components/MuscleGroupSplit.jsx';
import GuestHeader from '../components/GuestHeader.jsx';
import Offline from '../components/Offline.jsx';

const Progress = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { workouts, isLoading, isError, message } = useSelector((state) => state.workout);
    const isOnline = useOnlineStatus();

    useEffect(() => {
        if (isError) {
            console.log(message);
        }

        if (!user){
            navigate('/login');
            return;
        }

        if (isOnline){
            dispatch(getWorkouts());
        }

        return () => {
            dispatch(reset());
        }

    }, [user, isError, message, navigate, dispatch]);

    // Calculate stats
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

    let totalWeight = 0;
    let totalReps = 0;
    let totalSets = 0;
    let totalExercises = 0;
    let heaviestLift = 0;

    workouts.forEach((w) => {
        w.exercises.forEach((ex) => {
            totalExercises++; // count exercises

            ex.sets.forEach((set) => {
                const weight = Number(set.weight) || 0;
                const reps = Number(set.reps) || 0;

                totalWeight += weight * reps;
                totalReps += reps;
                totalSets++;

                if (weight > heaviestLift) {
                    heaviestLift = weight;
                }
            });
        });
    });

    if(isLoading || !user){
        return (
            <Spinner />
        )
    }

    if(!isOnline) {
        return (
            <Offline />
        )
    }

    return (
        <section className="mt-15">
            <Header />
            {user.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}
            <div className="min-h-screen bg-[#2B2D42] px-6 py-12 mt-15">
                <h1 className="text-[#EDF2F4] text-6xl font-semibold text-center mb-8">
                    Progress <span className="text-[#EF233C]">Summary</span>
                </h1>
                {workouts.length > 0 ? (
                    <>
                        {/* Summary grid */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            <ProgressCard title="Total Workouts" value={totalWorkouts} />
                            <ProgressCard title="Total Exercises" value={totalExercises} />
                            <ProgressCard title="Total Duration" value={`${totalDuration} min`} />
                            <ProgressCard title="Total Sets" value={totalSets} />
                            <ProgressCard title="Total Weight Lifted" value={formatWeight(totalWeight, user.useImperial)} />
                            <ProgressCard title="Total Reps" value={totalReps} />
                        </div>

                        {/* Mobile Summary card */}
                        <MobileProgressCard
                            totalWorkouts={totalWorkouts}
                            totalExercises={totalExercises}
                            totalDuration={totalDuration}
                            totalSets={totalSets}
                            totalWeight={totalWeight}
                            totalReps={totalReps}
                        />

                        {/* Charts Section */}
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PBChart workouts={workouts} useImperial={user.useImperial}/>
                            <ExerciseProgressChart workouts={workouts} useImperial={user.useImperial}/>
                        </div>
                        <MuscleGroupSplit workouts={workouts} useImperial={user.useImperial}/>
                    </>
                ) : (
                    <div className="text-[#EDF2F4] text-xl text-center mt-10">
                        <h3>You have not completed any workouts!</h3>
                        <button className="rounded-lg bg-[#EF233C] px-4 py-2 mt-10 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                            <Link to='/new-workout'>
                                New Workout 
                            </Link>
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
};

// Export Progress
export default Progress;