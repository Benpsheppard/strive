document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById('currentUser').textContent = currentUser;

    // Attach event listeners to the static form
    const workoutDiv = document.querySelector('.workout');

    workoutDiv.querySelector('.addExerciseBtn').addEventListener('click', function () {
        addExercise(this);
    });

    workoutDiv.querySelector('.saveWorkoutBtn').addEventListener('click', function () {
        saveWorkout(this);
    });

    // Load saved exercise suggestions for datalist
    loadExerciseSuggestions();

    // Function to load exercise suggestions from localStorage
    function loadExerciseSuggestions() {
        const username = localStorage.getItem('currentUser');
        const data = JSON.parse(localStorage.getItem("gymTracker")) || {};
        const workouts = data[username]?.workouts || [];

        const allExercises = new Set();
        workouts.forEach(w => {
            w.exercises.forEach(ex => allExercises.add(ex.exercise));
        });

        let dataList = document.getElementById("exerciseList");
        if (!dataList) return;
        dataList.innerHTML = "";

        allExercises.forEach(exercise => {
            let option = document.createElement("option");
            option.value = exercise;
            dataList.appendChild(option);
        });
    }

    // Function to add exercise
    function addExercise(button) {
        const workoutDiv = button.closest('.workout');
        const titleInput = workoutDiv.querySelector('.workout-title');
        const title = titleInput.value;
        const name = workoutDiv.querySelector('.exercise-name').value;
        const weight = workoutDiv.querySelector('.exercise-weight').value;
        const reps = workoutDiv.querySelector('.exercise-reps').value;

        if (!name || !weight || !reps) {
            alert('Please fill in all fields.');
            return;
        }

        // Save exercise name for suggestions
        let savedExercises = JSON.parse(localStorage.getItem("exercises")) || [];
        if (!savedExercises.includes(name)) {
            savedExercises.push(name);
            localStorage.setItem("exercises", JSON.stringify(savedExercises));
            loadExerciseSuggestions();
        }

        // Replace workout title input with text only on first exercise
        if (titleInput.tagName === 'INPUT' && title) {
            const h2 = document.createElement('h2');
            h2.textContent = title;
            h2.className = 'workout-title';
            titleInput.replaceWith(h2);
        }

        // Add exercise entry
        const exercisesDiv = workoutDiv.querySelector('.exercises');
        const exerciseEntry = document.createElement('div');
        exerciseEntry.className = 'exercise';
        exerciseEntry.textContent = `${name} - ${weight}kg x ${reps} reps`;
        exercisesDiv.appendChild(exerciseEntry);

        // Clear inputs
        workoutDiv.querySelector('.exercise-name').value = '';
        workoutDiv.querySelector('.exercise-weight').value = '';
        workoutDiv.querySelector('.exercise-reps').value = '';
    }

    // Function to save workout
    function saveWorkout(button) {
        const workoutDiv = button.closest('.workout');
        const username = localStorage.getItem('currentUser') || 'Guest';

        const titleElement = workoutDiv.querySelector('.workout-title');
        const workoutTitle = titleElement.tagName === 'INPUT' 
            ? titleElement.value 
            : titleElement.textContent;

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

        let data = JSON.parse(localStorage.getItem("gymTracker")) || {};
        if (!data[username]) {
            data[username] = { workouts: [] };
        }

        data[username].workouts.push({
            date: new Date().toLocaleString(),
            name: workoutTitle,
            exercises: exercises
        });

        localStorage.setItem("gymTracker", JSON.stringify(data));

        alert(`Workout "${workoutTitle}" saved for ${username}!`);

        // ✅ Reset form back to original state
        workoutDiv.querySelector('.workout-title').replaceWith(
            (() => {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = 'Workout Title';
                input.className = 'workout-title';
                return input;
            })()
        );
        workoutDiv.querySelector('.exercises').innerHTML = '';
        workoutDiv.querySelector('.exercise-name').value = '';
        workoutDiv.querySelector('.exercise-weight').value = '';
        workoutDiv.querySelector('.exercise-reps').value = '';
    }
});
