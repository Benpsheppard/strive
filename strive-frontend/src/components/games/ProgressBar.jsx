// ProgressBar.jsx

const ProgressBar = ({ progressPercentage, numerator, denominator }) => {
    return (
        <div className='relative w-full bg-[#2B2D42] rounded-full h-6 overflow-hidden border-2 border-[#EDF2F4]'>

            {/* Fill */}
            <div className='bg-[#EF233C] h-6 transition-all duration-500 ease-out' style={{ width: `${progressPercentage}%` }} />

            {/* Text Overlay */}
            <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-xs font-bold text-white'>
                    {numerator} / {denominator}
                </span>
            </div>
        </div>
    )
}

export default ProgressBar