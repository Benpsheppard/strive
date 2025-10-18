// Features.jsx
const Features = () => {
    return (
        <section className="features bg-gray-50 py-16 px-6">
            <div className="max-w-6xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#2B2D42]">
                    Features
                </h2>
                <p className="text-gray-600 mt-4 text-lg">
                    <span className="text-[#EF233C]">Everything you need</span> to stay consistent, track your workouts, and celebrate your progress.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-[#EDF2F4] rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
                    <p className="track text-[#2B2D42] text-lg">
                        Set up a workout, get moving, and log every exercise as you go
                    </p>
                </div>

                {/* Card 2 */}
                <div className="bg-[#EDF2F4] rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
                    <p className="progress text-[#2B2D42] text-lg">
                        Visualise your progress with charts and stats designed to celebrate your consistency and push you to new levels
                    </p>
                </div>

                {/* Card 3 */}
                <div className="bg-[#EDF2F4] rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
                    <p className="view-prev text-[#2B2D42] text-lg">
                        View all previous workouts you've completed to see how far you've come
                    </p>
                </div>
                
            </div>
        </section>
    )
};

// Export Features
export default Features;
