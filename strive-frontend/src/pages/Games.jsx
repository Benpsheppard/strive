// Games.jsx

// Imports
import { useSelector } from 'react-redux';

// Component Imports
import Header from '../components/headers/Header.jsx';

const Games = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <>
            <Header />
            <section className="mt-15 min-h-screen">
                <div className="w-full fixed top-0 left-0 rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold mt-15 px-6 py-6">
                    <h1 className="text-[#EF233C] text-2xl">{user.username}</h1>
                    <p>Level {user.level}, {user.strivepoints} SP</p>
                </div>

                <div className="w-full rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold mt-50 px-6 py-6">
                    <h1 className="text-[#EF233C] text-xl">Coming Soon: </h1>
                    <ul>
                        <li>Quests for users to complete over varying time frames.</li>
                        <li>Weekly and Monthly contests.</li>
                    </ul>

                </div>

                {/* QUESTS */}
                {/* AI generated quests specific to users */}
                {/* Users must be level 10 to access */}


                {/* CONTESTS */}
                {/* Weekly and Montly contests */}
                {/* Multiplayer */}
                {/* Users must be level 15 to access */}                

            </section>
        </>
    );
};

export default Games;