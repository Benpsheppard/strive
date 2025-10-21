// Games.jsx

// Imports
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Function Imports
import { getQuests, generateQuests, generateQuest, deleteQuest } from '../features/quests/questSlice';
import { addPoints } from '../features/auth/authSlice.js';
import { getContest } from '../features/contests/contestSlice.js';

// Component Imports
import Header from '../components/headers/Header.jsx';
import QuestCard from '../components/games/QuestCard.jsx';
import Spinner from '../components/Spinner.jsx';

const Games = () => {
    const { user } = useSelector((state) => state.auth);
    const { quests, isLoading } = useSelector((state) => state.quests);
    const { contest } = useSelector((state) => state.contest);

    const dispatch = useDispatch();

    const [questsCompleted, setQuestsCompleted] = useState(0);

    const isLevelFive = user.level >= 5;
    const hasGeneratedRef = useRef(false);

    useEffect(() => {
        dispatch(getContest());

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
            <section className="mt-20 min-h-screen px-6 py-3">
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
                    <h2 className="text-[#EF233C] text-2xl mb-2">Quests</h2>
                    
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
                <div className="mt-6 mb-6 w-full rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold px-6 py-6">
                    <h2 className="text-[#EF233C] text-2xl mb-4">Monthly Contest</h2>

                    {contest ? (
                        <>
                        <h3 className="text-3xl mb-2">{contest.name}</h3>
                        <p className="text-lg mb-4">{contest.description}</p>
                        <p className="italic mb-4">Month: {contest.month.toUpperCase()}</p>

                        {contest.active ? (
                            <span className="inline-block bg-green-500 text-[#EDF2F4] px-3 py-1 rounded-full mb-4">
                            Active Now
                            </span>
                        ) : (
                            <span className="inline-block bg-gray-400 text-[#EDF2F4] px-3 py-1 rounded-full mb-4">
                            Ended
                            </span>
                        )}

                        {/* Rewards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-center">
                            <div className="bg-[#2B2D42] p-4 rounded-lg">
                            <h4 className="text-[#FFD700] text-xl">🥇 1st</h4>
                            <p>{contest.reward.first} SP</p>
                            </div>
                            <div className="bg-[#2B2D42] p-4 rounded-lg">
                            <h4 className="text-[#C0C0C0] text-xl">🥈 2nd</h4>
                            <p>{contest.reward.second} SP</p>
                            </div>
                            <div className="bg-[#2B2D42] p-4 rounded-lg">
                            <h4 className="text-[#CD7F32] text-xl">🥉 3rd</h4>
                            <p>{contest.reward.third} SP</p>
                            </div>
                        </div>
                        </>
                    ) : (
                        <p>No active contest this month. Check back soon!</p>
                    )}
                </div>

                {/* Contest Leaderboard */}
                <div className="mt-6 mb-6 w-full rounded-lg bg-[#8D99AE] text-[#EDF2F4] text-center font-semibold px-6 py-6">
                    <h2 className="text-[#EF233C] text-2xl mb-4">Contest Leaderboard</h2>
                    <p>Leaderboards coming soon!</p>
                </div>

            </section>
        </>
    );
};

export default Games;