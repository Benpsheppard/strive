// ProfileStats.jsx

// Function Imports
import { formatWeight, formatNumber } from '../../utils/formatValues.js'

const ProfileStats = ({ user }) => {
    return (
        <div className='space-y-3 bg-[#8D99AE] w-full md:max-w-2xl p-6 item-center text-[#2B2D42] text-center shadow-md rounded-xl'>
            <p className='text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40'>
                Level: <span className='text-[#EF233C]'>{user?.level}</span>
            </p>
            <p className='text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40'>
                Strive Points: <span className='text-[#EF233C]'>{formatNumber(user?.strivepoints, 0)} SP</span>
            </p>
            <p className='text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40'>
                Streak: <span className='text-[#EF233C]'>{user.streak.current}</span>
            </p>
            <p className='text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40'>
                Best Streak: <span className='text-[#EF233C]'>{user.streak.best}</span>
            </p>
            <p className='text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40'>
                Momentum: <span className='text-[#EF233C]'>{user.momentum.current}</span>
            </p>
            <p className="text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40">
                Target: <span className="text-[#EF233C]"> {user.target}-a-day</span> 
            </p>
            <p className="text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40">
                Height: <span className="text-[#EF233C]"> {user.height?.feet}' {user.height?.inches}"</span>
            </p>
            <p className="text-[#EDF2F4] text-xl font-semibold flex justify-between items-center border-b border-[#EDF2F4]/40">
                Weight: <span className="text-[#EF233C]"> {formatWeight(user.weight, user.useImperial)}</span>
            </p>
        </div>
    )
}

export default ProfileStats