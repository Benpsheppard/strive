let workoutCount = 0;   // Initialize workout count

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentUser').textContent = localStorage.getItem('currentUser') || 'Guest'; // Display current user

    // Function to handle new workout button click
    document.getElementById('newWorkoutBtn').addEventListener('click', () => {
        console.log('Creating a new workout...');  // Log message for debugging
        newWorkoutBtn.disabled = true; // Disable button while a workout is open
        createWorkout();  // Call createWorkout function when button is clicked 
    })

    // Function to create a new workout
    function createWorkout() {  
        workoutCount++; // Increment workout count

        const workoutDiv = document.createElement('div');   // Create a new div for the workout
        workoutDiv.className = 'workout';
        workoutDiv.innerHTML = `
        <input type="text" placeholder="Workout Title" class="workout-title"/>
        <div class="exercises"></div>
        <div class="exercise-input">
            <input type="text" placeholder="Exercise Name" class="exercise-name" /><br>
            <input type="number" placeholder="Weight (kg)" class="exercise-weight" /><br>
            <input type="number" placeholder="Reps" class="exercise-reps" /><br>
            <button class="addExerciseBtn">Add Exercise</button>
            <button class="saveWorkoutBtn">Save Workout</button>
        </div>
        `;  // Create HTML structure for the workout

        workoutDiv.querySelector('.addExerciseBtn').addEventListener('click', function () {
            addExercise(this);  // Call addExercise function when button is clicked

        });

        workoutDiv.querySelector('.saveWorkoutBtn').addEventListener('click', function () {
            saveWorkout(this);  // Call saveWorkout function when button is clicked
        });

        document.getElementById('workouts').appendChild(workoutDiv);
    }

    // Function to add exercise to workout
    function addExercise(button) {
        const workoutDiv = button.closest('.workout');  // Find the closest workout div
        const titleInput = workoutDiv.querySelector('.workout-title'); // Get the workout title input
        const title = titleInput.value; // Get the workout title
        const name = workoutDiv.querySelector('.exercise-name').value; // Get the exercise name
        const weight = workoutDiv.querySelector('.exercise-weight').value; // Get the weight
        const reps = workoutDiv.querySelector('.exercise-reps').value; // Get the number of reps

        if (!name || !weight || !reps) {    // Check if all fields are filled
            alert('Please fill in all fields.');
            return;
        }

        const exercisesDiv = workoutDiv.querySelector('.exercises'); // Find the exercise's div within the workout
        const exerciseEntry = document.createElement('div');    // Create a new div for the exercise entry

        // If the title is an input, replace it with an h2 element
        if(titleInput.tagName === 'INPUT' && title) {
            const h2 = document.createElement('h2'); // Create an h2 element for the workout title
            const now = new Date();
            const fullString = now.toLocaleString(); // e.g. "17/08/2025, 10:32:45"
            h2.textContent = title; // Set the text content to the workout title
            h2.className = 'workout-title';
            workoutDiv.querySelector('.workout-title').replaceWith(h2); // Replace the input with the h2
        }
        
        exerciseEntry.className = 'exercise'; 
        exerciseEntry.textContent = `${name} - ${weight}kg x ${reps} reps`;
        exercisesDiv.appendChild(exerciseEntry); // Append the new exercise entry to the exercises div

        // Clear inputs
        workoutDiv.querySelector('.exercise-name').value = '';
        workoutDiv.querySelector('.exercise-weight').value = '';
        workoutDiv.querySelector('.exercise-reps').value = '';
    }

    // Function to save the workout
    function saveWorkout(button) {
        console.log('Saving workout...');  // Log message for debugging

        const workoutDiv = button.closest('.workout');
        const username = localStorage.getItem('currentUser') || 'Guest';

        // Get workout title
        const titleElement = workoutDiv.querySelector('.workout-title');
        const workoutTitle = titleElement.tagName === 'INPUT' 
            ? titleElement.value 
            : titleElement.textContent;

        // Collect all exercises
        const exerciseElements = workoutDiv.querySelectorAll('.exercise');
        const exercises = Array.from(exerciseElements).map(ex => {
            const [name, rest] = ex.textContent.split(" - ");
            const [weight, reps] = rest.split(" x ");
            return {
                exercise: name,
                weight: weight.replace("kg", "").trim(),
                reps: reps.replace("reps", "").trim()
            };
        });

        if (!workoutTitle || exercises.length === 0) {
            alert("Please give your workout a title and add at least one exercise.");
            return;
        }

        // Get existing data
        let data = JSON.parse(localStorage.getItem("gymTracker")) || {};

        // Make sure user exists
        if (!data[username]) {
            data[username] = { workouts: [] };
        }

        // Save workout
        data[username].workouts.push({
            date: new Date().toLocaleString(),
            name: workoutTitle,
            exercises: exercises
        });

        // Save back to localStorage
        localStorage.setItem("gymTracker", JSON.stringify(data));

        alert(`Workout "${workoutTitle}" saved for ${username}!`);

        workoutDiv.remove(); // Remove the workout div after saving
        newWorkoutBtn.disabled = false; // Re-enable the button for next workout
    }
}); 

