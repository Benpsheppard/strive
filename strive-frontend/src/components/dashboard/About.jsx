// About.jsx
const About = () => {
    return (
        <section className="about bg-[#EDF2F4] py-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-[#2B2D42] mb-10">
                    Your Personal <span className="text-[#EF233C]">Gym Tracker</span>
                </h2>
                <div className="space-y-8 text-lg text-[#8D99AE]">
                    <p className="consistent">
                        Helping you <span className="text-[#EF233C]">stay consistent</span>, even when motivation is low
                    </p>
                    <p className="track">
                        Track your progress from <span className="text-[#EF233C]">your first to your hundredth</span> workout
                    </p>
                    <p className="progress">
                        View your gym <span className="text-[#EF233C]">statistics and progress charts</span> to see how far you've come
                    </p>
                </div>
            </div>
        </section>
    )
};


// Export About
export default About;