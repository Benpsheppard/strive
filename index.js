let workoutCount = 0;   // Initialize workout count

document.addEventListener('DOMContentLoaded', () => {
    // Function to handle the new workout button click
    document.getElementById('newWorkoutBtn').addEventListener('click', () => {
        console.log('Creating a new workout...');  // Log message for debugging
        createWorkout();  // Call createWorkout function when button is clicked
    })

    // Function to create a new workout
    function createWorkout() {  
        workoutCount++; // Increment workout count

        const workoutDiv = document.createElement('div');   // Create a new div for the workout
        workoutDiv.className = 'workout';
        workoutDiv.innerHTML = `
        <h2>Workout #${workoutCount}</h2>
        <div class="exercises"></div>
        <div class="exercise-input">
            <input type="text" placeholder="Exercise Name" class="exercise-name" />
            <input type="number" placeholder="Weight (kg)" class="exercise-weight" />
            <input type="number" placeholder="Reps" class="exercise-reps" />
            <button class="addExerciseBtn">Add Exercise</button>
        </div>
        `;  // Create HTML structure for the workout

        workoutDiv.querySelector('.addExerciseBtn').addEventListener('click', function () {
            addExercise(this);  // Call addExercise function when button is clicked
        });

        document.getElementById('workouts').appendChild(workoutDiv);
    }

    // Function to add exercise to workout
    function addExercise(button) {
        const workoutDiv = button.closest('.workout');  // Find the closest workout div
        const name = workoutDiv.querySelector('.exercise-name').value; // Get the exercise name
        const weight = workoutDiv.querySelector('.exercise-weight').value; // Get the weight
        const reps = workoutDiv.querySelector('.exercise-reps').value; // Get the number of reps

        if (!name || !weight || !reps) {    // Check if all fields are filled
        alert('Please fill in all exercise fields.');
        return;
        }

        const exercisesDiv = workoutDiv.querySelector('.exercises'); // Find the exercise's div within the workout

        const exerciseEntry = document.createElement('div');    // Create a new div for the exercise entry
        exerciseEntry.className = 'exercise';
        exerciseEntry.textContent = `${name} - ${weight}kg x ${reps} reps`;

        exercisesDiv.appendChild(exerciseEntry); // Append the new exercise entry to the exercises div

        // Clear inputs
        workoutDiv.querySelector('.exercise-name').value = '';
        workoutDiv.querySelector('.exercise-weight').value = '';
        workoutDiv.querySelector('.exercise-reps').value = '';
    }
}); 

