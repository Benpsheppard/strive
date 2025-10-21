// Games.jsx

// Imports
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Function Imports
import { getQuests, generateQuests, generateQuest, deleteQuest } from '../features/quests/questSlice';
import { addPoints } from '../features/auth/authSlice.js';

// Component Imports
import Header from '../components/headers/Header.jsx';
import QuestCard from '../components/games/QuestCard.jsx';
import Spinner from '../components/Spinner.jsx';

const Games = () => {
    const { user } = useSelector((state) => state.auth);
    const { quests, isLoading } = useSelector((state) => state.quests);

    const dispatch = useDispatch();

    const [questsCompleted, setQuestsCompleted] = useState(0);

    const isLevelFive = user.level >= 5;
    const hasGeneratedRef = useRef(false);

    useEffect(() => {
        if (!isLevelFive || hasGeneratedRef.current) return;

        hasGeneratedRef.current = true;

        dispatch(getQuests()).unwrap().then((fetchedQuests) => {
            if (fetchedQuests && fetchedQuests.length === 0) {
                dispatch(generateQuests());
            }
        });
    }, [dispatch, isLevelFive]);

    const onQuestClick = async (quest) => {
        if (quest.status === 'completed') {
            // Delete conmpleted quest
            await dispatch(deleteQuest(quest._id));

            // Reward user for completion
            await dispatch(addPoints({ userId: user._id, amount: quest.reward }));

            // Generate a new quest in its place
            await dispatch(generateQuest());

            // Increment number of quests completed
            setQuestsCompleted(prev => prev + 1);

            // Alert user
            toast.success(`${quest.title} Completed! +${quest.reward}SP`);
        } else if (new Date(quest.expiry) < new Date()) {
            // Delete expired quest
            await dispatch(deleteQuest(quest._id));

            // Generate a new quest in its place
            await dispatch(generateQuest());
        } else {
            // Quest still active but not completed
            toast.info('Quest not completed yet! Keep working on it.');
        }
    };

    if (isLoading) {
        return <Spinner />
    }

    return (
        <>
            <Header />
            <section className="mt-20 min-h-screen px-6">
                <h1 className="text-6xl font-semibold text-[#EDF2F4] text-center px-5 py-5">
                    Welcome to Strive <span className="text-[#EF233C]">Games</span>
                </h1>

                {/* Top Banner */}
                <div className="w-full rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold px-6 py-6">
                    <h1 className="text-[#EF233C] text-2xl">{user.username}</h1>
                    <p>Level {user.level}, {user.strivepoints} SP, Quests completed: {questsCompleted}</p>
                </div>

                {/* Quests Section */}
                <div className="mt-6 w-full rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold px-6 py-6">
                    <h2 className="text-[#EF233C] text-xl mb-2">Quests</h2>
                    
                    {!isLevelFive && (
                        <p>Reach level 5 to unlock Quests!</p>
                    )}

                    {isLevelFive && quests?.length > 0 && (
                        <>
                        <p className="text-[#EDF2F4] text-xl mb-2">Complete your Quests and reap the rewards</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {quests.map((quest) => (
                                <QuestCard
                                    key={quest._id}
                                    quest={quest}
                                    onClick = {() => onQuestClick(quest)}
                                />
                            ))}
                        </div>
                        </>
                    )}
                </div>

                {/* Monthly Contest Section */}
                 <div className="mt-6 w-full rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold px-6 py-6">
                    <h2 className="text-[#EF233C] text-xl mb-2">Monthly Contest</h2>

                    <p>Monthly Contests coming soon...</p>
                </div>
            </section>
        </>
    );
};

export default Games;