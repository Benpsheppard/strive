// Contact.jsx

// Imports
import { useSelector } from 'react-redux';
import { useState } from 'react';

// Component Imports
import Header from '../components/headers/Header.jsx';
import Footer from '../components/dashboard/Footer.jsx';
import GuestHeader from '../components/headers/GuestHeader.jsx';

// Contact
const Contact = () => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const { workouts } = useSelector((state) => state.workout);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Handle input changes
    const onChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const onSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            alert("Please fill in all fields.");
            return;
        }

        // Create mailto link
        const subject = encodeURIComponent(`Message from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );

        // Open default mail client
        window.location.href = `mailto:ben@bensheppard.co.uk?subject=${subject}&body=${body}`;
        setFormData({ name: "", email: "", message: "" });
    };

    if (isLoading) {
        return (
            <Spinner />
        );
    }

    return (
        <section className="mt-15">
            <Header />
            {user.isGuest && <GuestHeader currentWorkouts={workouts.length}/>}
            <div className="min-h-screen bg-[#2B2D42] flex items-center justify-center px-4">
                <div className="w-full max-w-lg bg-[#8D99AE] p-8 rounded-2xl shadow-lg">
                    <h1 className="text-[#EDF2F4] text-3xl font-semibold text-center mb-6">
                        Contact Us
                    </h1>

                    {/* Contact Form */}
                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* Name */}
                        <div>
                            <label className="block text-[#EDF2F4] mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onChange}
                                required
                                placeholder="Your Name"
                                className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-[#8D99AE] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[#EDF2F4] mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                required
                                placeholder="your@email.com"
                                className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-[#8D99AE] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-[#EDF2F4] mb-1">
                                Message 
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={onChange}
                                required
                                placeholder="Write your message here..."
                                rows="5"
                                className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 text-[#EDF2F4] placeholder-[#8D99AE] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                            />
                        </div>

                        {/* Submit button */}
                        <button type="submit" className="w-full rounded-lg bg-[#EF233C] px-4 py-2 font-semibold text-[#EDF2F4] transition hover:bg-[#D90429]">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </section>
    );
};

// Export Contact
export default Contact;