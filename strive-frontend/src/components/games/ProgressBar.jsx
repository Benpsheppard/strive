// ProgressBar.jsx

import { useState, useEffect } from 'react'

const ProgressBar = ({ numerator, denominator, unit, label }) => {
    const [width, setWidth] = useState(0)

    // Guard against divide-by-zero and values outside 0..100
    const percentage = denominator > 0 ? Math.min(100, Math.max(0, (numerator / denominator) * 100)) : 0

    useEffect(() => {
        // Let the browser paint the 0-width state first, then animate to the value
        const id = requestAnimationFrame(() => setWidth(percentage))
        return () => cancelAnimationFrame(id)
    }, [percentage])

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={denominator}
            aria-valuenow={Math.min(numerator, denominator)}
            className="relative h-8 w-full overflow-hidden rounded-xl border border-line bg-bg"
        >
            <div
                className="h-full bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${width}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow">
                    {numerator} / {denominator} {unit ?? ''}
                </span>
            </div>
        </div>
    )
}

export default ProgressBar
