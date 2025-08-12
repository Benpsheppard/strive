document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("currentUser"); // Clear the current user from localStorage
    window.location.href = "login.html"; // Redirect to the login page
});