// WeightToggle.jsx

const WeightToggle = ({ useImperial, onToggle }) => {
    return (
        <div className="bg-[#2B2D42] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <span className="text-[#EDF2F4] font-semibold">Weight Unit:</span>
                <div className="flex items-center gap-3">
                    <span className={`text-sm ${!useImperial ? 'text-[#EDF2F4] font-bold' : 'text-[#8D99AE]'}`}>
                        KG
                    </span>
                    <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF233C] focus:ring-offset-2 ${useImperial ? 'bg-[#EF233C]' : 'bg-[#8D99AE]'}`}>
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-[#EDF2F4] transition-transform ${
                                useImperial ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                    <span className={`text-sm ${useImperial ? 'text-[#EDF2F4] font-bold' : 'text-[#8D99AE]'}`}>
                        LBS
                    </span>
                </div>
            </div>
        </div>
    );
};

// Export
export default WeightToggle;