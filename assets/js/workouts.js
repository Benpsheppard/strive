const currentUser = localStorage.getItem('currentUser'); // Get the current user

document.addEventListener('DOMContentLoaded', () => {

    if (!currentUser) {
        window.location.href = "login.html"; // Redirect if not logged in
        return;
    }

    document.getElementById('currentUser').textContent = currentUser; // Display current user
    loadWorkouts();

    const filterBtn = document.getElementById('filter-workouts-btn');
    filterBtn.addEventListener('click', filterWorkouts);
});

function loadWorkouts() {
    const data = JSON.parse(localStorage.getItem('gymTracker')); // Load data
    if (!data || !data[currentUser] || !data[currentUser].workouts) return;

    const workouts = data[currentUser].workouts; // Get workouts
    const container = document.getElementById('workoutsContainer');

    workouts.forEach(workout => {
        // Workout card container
        const workoutCard = document.createElement('div');
        workoutCard.className = 'workout-card';

        // Calculate total weight
        let totalWeight = 0;
        workout.exercises.forEach(exercise => {
            totalWeight += exercise.weight * exercise.reps;
        });

        // Summary (always visible)
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'workout-summary';
        summaryDiv.textContent = `${workout.name} (${workout.date}) | ${workout.exercises.length} Exercises | ${totalWeight}`;
        workoutCard.appendChild(summaryDiv);

        // Details (hidden by default)
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'workout-details';

        workout.exercises.forEach(exercise => {
            const p = document.createElement('p');
            p.className = 'exercise';
            p.textContent = `${exercise.exercise} - ${exercise.weight}kg x ${exercise.reps} reps`;
            detailsDiv.appendChild(p);
        });

        workoutCard.appendChild(detailsDiv);
        container.appendChild(workoutCard);
    });

    // Add click toggle for expand/collapse
    document.querySelectorAll('.workout-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });
}