// SetForm.jsx

const SetForm = ({ currentExercise, currentSet, handleSetChange}) => {
    const { trackingMode } = currentExercise
    const inputClass = "w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"

    switch (trackingMode) {
        case 'weight_reps':
            return (
                <div className="flex gap-2">
                    <input type="number" name="weight" value={currentSet.weight} onChange={handleSetChange} placeholder="Weight *" className={inputClass} min="0" />
                    <input type="number" name="reps" value={currentSet.reps} onChange={handleSetChange} placeholder="Reps *" className={inputClass} min="0" />
                </div>
            )
        default:
            return (
                <p role="alert" className="text-sm text-[#EF233C]">
                    trackingMode no longer supported
                </p>
            )
    }
}

export default SetForm