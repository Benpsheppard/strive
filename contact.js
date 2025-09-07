document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');    // Get the current user from localStorage

    if (!currentUser) {
        window.location.href = "login.html"; // Redirect to login if no user is logged in
        return;
    }
    document.getElementById('currentUser').textContent = currentUser; // Display current user
});
