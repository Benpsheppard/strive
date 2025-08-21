document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser') || 'Guest';
    document.getElementById('currentUser').textContent = currentUser; // Display current user

    const data = JSON.parse(localStorage.getItem('gymTracker'));    // Load data from localStorage
    const userData = data[currentUser]; // get current user's data
    const workouts = userData.workouts || []; // get current user's workouts
    
    const container = document.getElementById('workoutsContainer'); // Get the container for workouts

    workouts.forEach(workout => {   // Loop through each workout and create elements
        const workoutDiv = document.createElement('div');
        workoutDiv.className = 'workout';
        
        const name = document.createElement('h3');
        name.textContent = `${workout.name} (${workout.date})`;
        workoutDiv.appendChild(name);
        
        workout.exercises.forEach(exercise => {
            const p = document.createElement('p');
            p.className = 'exercise';
            p.textContent = `${exercise.exercise} - ${exercise.weight}kg x ${exercise.reps} reps`;
            workoutDiv.appendChild(p);
        });
        
        container.appendChild(workoutDiv);
    });

});


