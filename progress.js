document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');    // Get the current user from localStorage
    console.log('Current User:', currentUser); // Debug

    if (!currentUser) {
        window.location.href = "login.html"; // Redirect to login if no user is logged in
        return;
    }

    document.getElementById('currentUser').textContent = currentUser; // Display current user
    renderSummaryCard(); // Render the summary card for the current user
});

function getTotalWorkouts(workouts) {
    return workouts.length;
}

function renderSummaryCard() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const gymDataRaw = localStorage.getItem("gymTracker");
    const gymData = gymDataRaw ? JSON.parse(gymDataRaw) : {};
    const userData = gymData[currentUser];

    const workouts = userData?.workouts || [];

    console.log("Workouts:", workouts); // Debug
    const totalWorkoutsSpan = document.getElementById("total-workouts");
    if (totalWorkoutsSpan) totalWorkoutsSpan.textContent = workouts.length;
}
