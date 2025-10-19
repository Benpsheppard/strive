// pbDetection.js

export const calculatePersonalBests = (workouts) => {
  const exercisePBs = {};

  workouts.forEach((workout) => {
    const workoutDate = workout.date || workout.createdAt || 'Unknown date';

    workout.exercises.forEach((exercise) => {
      const name = exercise.name;
      const muscleGroup = exercise.musclegroup || 'Other';
      
      exercise.sets.forEach((set) => {
        const weight = Number(set.weight) || 0;
        if (!exercisePBs[name] || weight > exercisePBs[name].weight) {
          exercisePBs[name] = { weight, date: workoutDate, muscleGroup };
        }
      });
    });
  });

  return exercisePBs;
};

export const detectNewPBs = (newWorkout, existingWorkouts) => {
  // Calculate existing PBs (before this workout)
  const existingPBs = calculatePersonalBests(existingWorkouts);
  
  const newPBs = [];

  newWorkout.exercises.forEach((exercise) => {
    const exerciseName = exercise.name;
    const maxWeightInWorkout = Math.max(
      ...exercise.sets.map(set => Number(set.weight) || 0)
    );

    // Check if this is a new PB
    if (maxWeightInWorkout > 0) {
      const existingPB = existingPBs[exerciseName];
      
      if (!existingPB || maxWeightInWorkout > existingPB.weight) {
        newPBs.push({
          exerciseName,
          newWeight: maxWeightInWorkout,
          oldWeight: existingPB ? existingPB.weight : 0,
          isFirstTime: !existingPB
        });
      }
    }
  });

  return newPBs;
};