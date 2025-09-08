// ----------------------- Initialization ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  document.getElementById('currentUser').textContent = currentUser;

  const gymDataRaw = localStorage.getItem('gymTracker');
  const gymData = gymDataRaw ? JSON.parse(gymDataRaw) : {};
  let userData = gymData[currentUser] || { workouts: [] };
  let workouts = userData.workouts || [];

  // ✅ Use your actual functions
  getOrCreateAchievements(userData, workouts);
  checkAchievements(userData, workouts, gymData, currentUser);

  renderSummaryCard(workouts, userData);
  renderPBChart(workouts);        
  renderAchievements(userData);
});

// ------------------------------- Get Totals ------------------------------
// function to get total number of workouts completed
function getTotalWorkouts(workouts) {
    return workouts.length;
}

// function to get total number of exercises completed
function getTotalExercises(workouts) {
    return workouts.reduce((total, workout) => total + (workout.exercises ? workout.exercises.length : 0), 0);
}

// function to get total number of reps completed
function getTotalReps(workouts) {
    let totalReps = 0;

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            const reps = Number(exercise.reps);
            totalReps += reps;
        });
    });
    return totalReps;
}

// function to get total weight lifted
function getTotalWeight(workouts) {
    let totalWeight = 0;

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            const weight = Number(exercise.weight);
            const reps = Number(exercise.reps);
            totalWeight += weight * reps;
        });
    });
    return totalWeight;
}

// function to find personal bests
function personalBests(workouts) {
    const pb = {};
    workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            const weight = Number(exercise.weight);
            const date = workout.date;
            if (!pb[exercise.exercise] || weight > pb[exercise.exercise].weight) {
                pb[exercise.exercise] = { weight, date };
            }
        });
    });
    return pb;
}

// ---------------------- Achievements Functions ------------------------------
// function to generate a strength achievement
function generateStrengthAchievement(workouts) {
  const pb = personalBests(workouts);
  const lifts = Object.keys(pb);

  if (lifts.length === 0) {
    return "Strength goal: Log your first workout 💪";
  }

  const exercise = lifts[Math.floor(Math.random() * lifts.length)];
  const currentMax = pb[exercise].weight; // ✅ now consistent
  const target = Math.round(currentMax * 1.05 / 2) * 2; // +5%, rounded

  return `Strength goal: ${exercise} ${target}kg`;
}


// function to initialize 3 achievements if missing
function getOrCreateAchievements(userData, workouts) {
    if (!userData.achievements) {
        userData.achievements = [];
        for (let i = 0; i < 3; i++) {
            userData.achievements.push({
                type: "strength",
                text: generateStrengthAchievement(workouts)
            });
        }
        userData.completedAchievements = 0;
    }
    return userData.achievements;
}

// function to check achievements and replace if completed
function checkAchievements(userData, workouts, gymData, currentUser) {
    if (!userData.achievements) return;

    userData.achievements.forEach((achievement, index) => {
        let completed = false;

        if (achievement.type === "strength") {
            const match = achievement.text.match(/Strength goal: (.+) (\d+)kg/);
            if (match) {
                const exercise = match[1].trim();
                const target = Number(match[2]);
                const pb = personalBests(workouts)[exercise] || 0;

                if (pb >= target) completed = true;
            }
        }

        if (completed) {
            userData.completedAchievements++;
            alert(`🎉 Achievement unlocked: ${achievement.text}`);

            // Replace with a new strength goal
            userData.achievements[index] = {
                type: "strength",
                text: generateStrengthAchievement(workouts)
            };

            // Save immediately
            gymData[currentUser] = userData;
            localStorage.setItem("gymTracker", JSON.stringify(gymData));
        }
    });
}

// ---------------------- Render to UI Functions ------------------------------
// function to render achievements to UI
function renderAchievements(userData) {
    const listEl = document.getElementById("achievements-list");
    if (!listEl) return;

    const achievements = userData.achievements || [];
    listEl.innerHTML = achievements.map(a => `<li>${a.text}</li>`).join("");
}

// function to render the summary card
function renderSummaryCard(workouts, userData) {
  const totalWorkoutsSpan = document.getElementById("total-workouts");
  const totalExercisesSpan = document.getElementById("total-exercises");
  const totalRepsSpan = document.getElementById("total-reps");
  const totalWeightSpan = document.getElementById("total-weight");
  const totalAchievementsSpan = document.getElementById("total-achievements");

  if (totalWorkoutsSpan) totalWorkoutsSpan.textContent = getTotalWorkouts(workouts);
  if (totalExercisesSpan) totalExercisesSpan.textContent = getTotalExercises(workouts);
  if (totalRepsSpan) totalRepsSpan.textContent = getTotalReps(workouts);
  if (totalWeightSpan) totalWeightSpan.textContent = getTotalWeight(workouts);

  if (totalAchievementsSpan) totalAchievementsSpan.textContent = userData.completedAchievements || 0;
}

// function to render personal best chart using Chart.js
function renderPBChart(workouts) {
  const pbData = personalBests(workouts);

  const labels = Object.keys(pbData);
  const weights = Object.values(pbData).map(pb => pb.weight);

  const ctx = document.getElementById('pb-chart').getContext('2d');
  if (window.pbChart) window.pbChart.destroy();

  window.pbChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Personal Best (kg)',
        data: weights,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const exercise = context.label;
              const { weight, date } = pbData[exercise];
              return date ? `${weight} kg (Achieved: ${date})` : `${weight} kg`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Weight (kg)' }
        }
      }
    }
  });
}
