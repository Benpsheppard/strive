// Normalise helper
export const normaliseExercise = (name = '') => {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

// Compare exercise arrays helper
export const arraysEqualByName = (a = [], b = []) => {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i].name !== b[i].name) return false;
    }
    return true;
};

// Compute uniqueExercises from workouts
export const getUniqueExercises = (workouts) => {
  const exerciseMap = new Map();
  workouts.forEach((workout) => {
    workout.exercises?.forEach((exercise) => {
      const normalizedName = normaliseExercise(exercise.name);
      if (!exerciseMap.has(normalizedName)) {
        exerciseMap.set(normalizedName, {
          name: normalizedName,
          musclegroup: exercise.musclegroup,
          description: exercise.description || ''
        });
      }
    });
  });
  return Array.from(exerciseMap.values());
};