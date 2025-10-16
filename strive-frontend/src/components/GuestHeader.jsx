// GuestHeader.jsx
const GuestHeader = ({ currentWorkouts }) => {
    const maxWorkouts = 5;
    const workoutsLeft = maxWorkouts - currentWorkouts;

    return (
        <div className="w-full bg-[#EF233C] text-[#EDF2F4] font-semibold px-4 py-3 flex flex-col items-center text-sm font-medium shadow-md">
            <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-1 sm:gap-0">
                <span className="sm:mr-2">
                    Guest account: {currentWorkouts}/{maxWorkouts} workouts
                </span>
                {currentWorkouts >= maxWorkouts ? (
                    <span className="sm:py-2 sm:px-2">
                        Upgrade to a free Strive account for unlimited workouts!
                    </span>
                ) : (
                    <span className="sm:py-2 sm:px-2">
                        You can do {workoutsLeft} more workout{workoutsLeft > 1 ? 's' : ''} before upgrading.
                    </span>
                )}
            </div>
        </div>
    );
};

export default GuestHeader;