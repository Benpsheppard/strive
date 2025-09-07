document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');    // Get the current user from localStorage

    if (!currentUser) {
        window.location.href = "login.html"; // Redirect to login if no user is logged in
        return;
    }

    document.getElementById('currentUser').textContent = currentUser; // Display current user

    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem("currentUser"); // Clear the current user from localStorage
        window.location.href = "login.html"; // Redirect to the login page
    });
});





