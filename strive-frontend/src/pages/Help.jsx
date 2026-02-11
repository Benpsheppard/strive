// Help.jsx

// Component Imports
import Header from "../components/headers/Header"
import Footer from "../components/dashboard/Footer"

const Help = () => {
  return (
    <>
      <Header />
      <section className="min-h-screen flex flex-col text-[#EDF2F4] mx-auto max-w-4xl px-4 py-8 mt-15">
        <h1 className="text-3xl text-[#EDF2F4] text-center">How To <span className="text-[#EF233C]">Strive</span></h1>
        <p>To access Strive's core functionality, please make sure you are logged in, eiher with a personal Strive account or a limited Guest account.</p>
        {/* New Workout Help */}
        <h2 className="text-2xl mt-6 mb-2">New <span className="text-[#EF233C]">Workout</span></h2>
        <p className="mb-4">This page is used to log new workouts and save them to your account.</p>
        <ul>
            <li>- Click 'Start Workout' to begin entering your workout data.</li>
            <li>- Each workout has a title - entered by you - and a duration taken from the time you press start, to the time you press end.</li>
            <li>- Each workout is built up of exercises each of these have a name, muscle group and an optional description.</li>
            <li>- Each exercise can have multiple sets enter each set you complete with their respective weight and reps and click the 'Add Set' (mobile) or ' + ' (desktop) button to save.</li>
            <li>- Once your done with each exercise, click the 'Add Exercise' button to save the exercise and start a new one.</li>
            <li>- After you've completed your workout and filled all the data out, don't forget to click 'End Workout' for accurate duration statistics.</li>
            <li>- Clicking 'End Workout' will save your workout to your account, and completed workouts can be view on the 'Previous Workout' page.</li>
            <li>- Workouts can be cancelled at any time by simply clicking the 'Cancel Workout' button.</li>
        </ul>
        {/* Previous Workouts Help */}
        <h2 className="text-2xl mt-6 mb-2">Previous <span className="text-[#EF233C]">Workouts</span></h2>
        <p className="mb-4">This page displays all your previously logged workouts.</p>
        <ul>
            <li>- Previous Workouts are listed as cards, each with their title, duration, number of exercises and the date it was completed.</li>
            <li>- Clicking on any workout completed will expand the card, revealing the separate exercises you completed within that workout.</li>
            <li>- Each exercise is displayed as a drop-down menu, so each exercise can be expanded to view the different sets completed.</li>
            <li>- Workouts can be deleted here by clicking the red 'X' button in the top right hand corner of the workouts card.</li>
        </ul>
        {/* Progress Help */}
        <h2 className="text-2xl mt-6 mb-2 text-[#EF233C]">Progress</h2>
        <p className="mb-4">This page displays your progress using data you have submitted previously.</p>
        <ul>
            <li>- Your accounts general statistics like total workouts logged, total workout duration etc are displayed at the top of the screen.</li>
            <li>- Below the statistics are two graphs the first displays Personal Bests in each exercise you've logged and the second displays each exercises weight progression.</li>
            <li>- The personal best graph can be filtered by muscle group, allowing for easier viewing and comparisons. Use the drop down menu at the top to select one.</li>
            <li>- The exercise progression graph can be filtered by exercise, allowing you to view the weight progression of specific exercises. Select an exercise you've logged from the drop down menu.</li>
        </ul>
        {/* Games Help */}
        <h2 className="text-2xl mt-6 mb-2 text-[#EF233C]">Games</h2>
        <p className="mb-4">This page displays your Games dashboard, including your account level and quests.</p>
        <ul>
            <li>- The top banner displays your username, account level, SP (Strive Points) count and the number of quests you've completed.</li>
            <li>- Each user gets 3 active quests for them to complete.</li>
            <li>- Users must reach level 5 to unlock Quests.</li>
            <li>- Each quest is AI generated - using Anthropic AI. The titles, descriptions, difficulty and reward are all determined by AI.</li>
            <li>- AI generates quests depending on your most recent 10 workouts. It takes into account achievability as well as progressive overload.</li>
            <li>- To complete a quest, read it's description and get working out! After submitting a workout, the criteria for all 3 quests are checked for completion.</li>
            <li>- Completed quests will turn green and prompt you to click on them to claim your SP reward. On clicking the quest, you will recieve both your reward and a new quest in it's place.</li>
            <li>- Quests have expiry dates, outlined in the quests description. Each quest will be one of 'daily', 'weekly' or 'monthly' depending on difficulty.</li>
            <li>- Expired quests will turn red and prompt you to click on them to generate a new one in it's place. No reward will be received for expired quests.</li>
        </ul>
        {/* Contact Help */}
        <h2 className="text-2xl mt-6 mb-2 text-[#EF233C]">Contact</h2>
        <p className="mb-4">This page displays a contact form for you to fill out with any concerns, issues, feedback or support.</p>
        <ul>
          <li>- Enter your name, email address and the message you want to send.</li>
          <li>- Click 'Send Message' to bring up your email provider to send the email.</li>
        </ul>
        {/* Profile Help */}
        <h2 className="text-2xl mt-6 mb-2 text-[#EF233C]">Profile</h2>
        <p className="mb-4">This page displays your account information and allows you to log out or delete your account.</p>
        <ul>
          <li>- Your username, email address and date joined are displayed here.</li>
          <li>- Click 'Log out' to sign out of your account. You will have to log back in again to access your workouts.</li>
          <li>- Click 'Delete Account' if you wish to delete your account and erase your data from our servers.</li>
        </ul>
      </section>
      <Footer />
    </>
    )
}

// Export
export default Help