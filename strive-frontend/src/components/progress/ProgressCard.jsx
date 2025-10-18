const ProgressCard = ({ title, value }) => {
    return (
        <div className="bg-[#8D99AE] p-6 rounded-2xl shadow-lg text-center transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-[#EDF2F4] text-xl">{title}</h2>
            <p className="text-[#EF233C] text-2xl font-bold">{value}</p>
        </div>
    )
};

// Export
export default ProgressCard;