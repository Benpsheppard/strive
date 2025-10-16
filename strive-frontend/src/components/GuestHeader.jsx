// GuestHeader.jsx
const GuestHeader = ({ currentWorkouts }) => {
    const maxWorkouts = 5;
    const workoutsLeft = maxWorkouts - currentWorkouts;
    const progressPercentage = (currentWorkouts / maxWorkouts) * 100;

    return (
        <div className="w-full bg-[#EF233C] text-[#EDF2F4] font-semibold px-4 py-1 flex flex-col items-center text-sm font-medium shadow-md">
            <div className="flex justify-center items-center">
                <span className="mr-2">
                    You are using a Guest account: {currentWorkouts}/{maxWorkouts} workouts completed.
                </span>
                {currentWorkouts >= maxWorkouts ? (
                    <span className="py-2 px-2">
                        Upgrade to a free Strive account for unlimited workouts!
                    </span>
                ) : (
                    <span className="py-2 px-2">
                        You can do {workoutsLeft} more workout{workoutsLeft > 1 ? 's' : ''} before upgrading for free.
                    </span>
                )}
            </div>
        </div>
    );
};

export default GuestHeader;
