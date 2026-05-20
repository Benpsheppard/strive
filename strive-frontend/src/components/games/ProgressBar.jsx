import { useState, useEffect } from "react"

const ProgressBar = ({ numerator, denominator, unit }) => {
    const [width, setWidth] = useState(0)
    const progressPercentage = (numerator / denominator) * 100

    useEffect(() => {
        // Let the browser paint the 0-width state first, then update
        const id = requestAnimationFrame(() => setWidth(progressPercentage))

        return () => cancelAnimationFrame(id)
    }, [progressPercentage])

    return (
        <div className='relative w-full bg-[#2B2D42] rounded-xl h-10 overflow-hidden border-2 border-[#EDF2F4]'>

            {/* Fill */}
            <div
                className='bg-[#EF233C] h-10 transition-[width] duration-700 delay-500 ease-out'
                style={{ width: `${width}%` }}
            />

            {/* Text Overlay */}
            <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-xs font-bold text-white'>
                    {numerator} / {denominator} {unit ?? ''}
                </span>
            </div>
        </div>
    )
}

export default ProgressBar