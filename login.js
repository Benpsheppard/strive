document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Get the values from the input fields
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];


    // Simple validation
    if (!users[email]) {
        alert("User not found");
        return;
    }
    if (users[email].password !== password) {
        alert("Incorrect password!");
        return;
    }

    // Set the current user in localStorage
    localStorage.setItem("currentUser", email);
    
    // Redirect to the main page
    window.location.href = "index.html";
});