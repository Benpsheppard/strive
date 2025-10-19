// SetForm.jsx

// Imports
import { FaPlus } from 'react-icons/fa';

// Function Imports;
import { getWeightUnit } from '../../utils/weightUnits.js';

const SetForm = ({ currentSet, handleSetChange, addSet, user }) => {
    const unit = getWeightUnit(user.useImperial);

    return (
        <div className="flex flex-col gap-2 mb-3 px-4 py-2 w-full shadow-lg rounded-lg">
            {/* Inputs row */}
            <div className="flex items-center gap-2 w-full">
                <input
                    type="number"
                    name="weight"
                    value={currentSet.weight}
                    onChange={handleSetChange}
                    placeholder={`Weight (${unit})`}
                    className="flex-1 min-w-0 rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-3 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                />
                <input
                    type="number"
                    name="reps"
                    value={currentSet.reps}
                    onChange={handleSetChange}
                    placeholder="Reps"
                    className="flex-1 min-w-0 rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-3 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                />

                {/* Desktop + Button */}
                <button type="button" onClick={addSet} className="hidden sm:flex w-10 h-10 items-center justify-center bg-[#EF233C] text-white rounded-lg transition hover:bg-[#D90429]">
                    <FaPlus />
                </button>
            </div>

            {/* Mobile Add Set Button */}
            <button type="button" onClick={addSet} className="sm:hidden w-full bg-[#EF233C] text-white py-2 rounded transition hover:bg-[#D90429]">
            Add Set
            </button>
        </div>

    );
};

// Export
export default SetForm;