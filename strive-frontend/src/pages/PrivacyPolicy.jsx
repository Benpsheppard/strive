// PrivacyPolicy.jsx

// Component Imports
import Header from '../components/headers/Header.jsx';
import Footer from '../components/dashboard/Footer.jsx';

const PrivacyPolicy = () => {
    return (
        <>
            <Header />
            <section className="min-h-screen flex flex-col text-[#EDF2F4] mx-auto max-w-4xl px-4 py-8 mt-15">
                <h1 className="text-3xl text-[#EDF2F4] text-center">
                    Privacy <span className="text-[#EF233C]">Policy</span>
                </h1>
                <p className="text-sm text-gray-400 mt-2">Last updated: October 2025</p>
                {/* Introduction */}
                <h2 className="text-2xl mt-6 mb-2">Introduction</h2>
                <p>
                    Strive is a Gym Tracker App designed to help users log workouts and track progress. 
                    This privacy policy explains how we collect, use and protect your information when using Strive.
                </p>
                {/* Info we collect */}
                <h2 className="text-2xl mt-6 mb-2">Information We Collect</h2>
                <ul>
                    <li>- Account info: Username, email address and password</li>
                    <li>- Workout data: exercises, weights, reps and dates completed</li>
                </ul>
                {/* How we use your info */}
                <h2 className="text-2xl mt-6 mb-2">How We Use Your Information</h2>
                <p>
                    We use your data to:
                </p>
                <ul>
                    <li> - Enable login and user account</li>
                    <li> - Save and display your workouts</li>
                    <li> - Generate AI quests to promote progress and consistency</li>
                </ul>
                {/* AI and Personalization */}
                <h2 className="text-2xl mt-6 mb-2">AI and Personalized Quests</h2>
                <p>
                    Strive uses artificial intelligence (AI) to generate personalized quests, challenges, and recommendations based on your workout data. 
                    This helps tailor the app experience to your goals, workout history, and performance trends.
                </p>
                <p>
                    The AI system processes data such as your logged exercises, workout frequency, and personal bests to suggest relevant quests and challenges. 
                    No personal information is shared externally, and all processing occurs securely within our system.
                </p>
                <p>
                    You can choose not to participate in AI-generated quests at any time by contacting <a href="mailto:ben@bensheppard.co.uk" className="text-[#EF233C]">ben@bensheppard.co.uk</a>.
                </p>

                {/* How data is stored */}
                <h2 className="text-2xl mt-6 mb-2">How We Store Your Data</h2>
                <p>
                    Your data is stored securely using a MongoDB database hosted by Render. 
                    We use industry-standard encryption and security measures to protect your information.
                </p>
                {/* Sharing and Disclosure */}
                <h2 className="text-2xl mt-6 mb-2">Sharing and Disclosure</h2>
                <p>
                    We do not share your personal information with third parties.
                </p>
                {/* Your Rights */}
                <h2 className="text-2xl mt-6 mb-2">Your Rights</h2>
                <p>
                    You can request to view, update or delete your personal information by contacting <a href="mailto:ben@bensheppard.co.uk" className="text-[#EF233C]">ben@bensheppard.co.uk</a>.
                </p>
                {/* Cookies and Analytics */}
                <h2 className="text-2xl mt-6 mb-2">Cookies and Analytics</h2>
                <p>
                    We use Umami Analytics to collect basic, anonymous usage data to help us understand how users interact with this app and improve its performance.
                    Umami does not use cookies and does not collect any personal or identifying information.
                    The data recorded includes metrics such as page views, referrer information, and device type, all of which are fully anonymized.
                    You can learn more about Umami at https://umami.is
                </p>
                {/* Changes to this Policy */}
                <h2 className="text-2xl mt-6 mb-2">Changes to this Policy</h2>
                <p>
                    We may update this privacy policy from time to time.
                    Any changes will be posted on this page with an updated revision date.
                </p>
                {/* Contact Us */}
                <h2 className="text-2xl mt-6 mb-2">Contact Us</h2>
                <p>
                    If you have any questions or concerns about this privacy policy, please contact <a href="mailto:ben@bensheppard.co.uk" className="text-[#EF233C]">ben@bensheppard.co.uk</a>.
                </p>
            </section>
            <Footer />
        </>
        
    );
};

// Export
export default PrivacyPolicy;