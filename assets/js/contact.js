document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');    // Get the current user from localStorage

    if (!currentUser) {
        window.location.href = "login.html"; // Redirect to login if no user is logged in
        return;
    }
    document.getElementById('currentUser').textContent = currentUser; // Display current user

    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent normal form submission

        const name = encodeURIComponent(document.getElementById('name').value);
        const email = encodeURIComponent(document.getElementById('email').value);
        const message = encodeURIComponent(document.getElementById('message').value);

        const mailtoLink = `mailto:ben@bensheppard.co.uk?subject=Contact Form Submission&body=Name: ${name}%0AEmail: ${email}%0AMessage: ${message}`;

        window.open(mailtoLink);
        this.reset();
    });
});
