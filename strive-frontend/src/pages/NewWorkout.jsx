// NewWorkout.jsx

// Imports
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Function Imports
import { createWorkout, getWorkouts, reset } from '../features/workouts/workoutsSlice.js';
import { detectNewPBs } from '../utils/pbDetection.js';
import { parseWeight, formatWeight } from '../utils/weightUnits.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { normaliseExercise, arraysEqualByName, getUniqueExercises } from '../utils/exerciseUtils.js';
import { addPoints } from '../features/auth/authSlice.js';

// Component Imports
import Header from '../components/headers/Header.jsx';
import WorkoutItem from '../components/workouts/WorkoutItem.jsx';
import Spinner from '../components/Spinner.jsx';
import ExerciseList from '../components/workouts/ExerciseList.jsx';
import SetList from '../components/workouts/SetList.jsx';
import SetForm from '../components/workouts/SetForm.jsx';
import GuestHeader from '../components/headers/GuestHeader.jsx';

// Muscle groups
const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Full body',
  'Other'
];

// Taglines
const TAGLINES = [
  'Consistency builds strength',
  'One more rep, one step closer',
  'No excuses, just results',
  'Push your limits',
  'Strive for progress, not perfection'
];

// New Workout
const NewWorkout = () => {
  // Redux & Routing
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { workouts = [], isLoading, isError, message } = useSelector((state) => state.workout);

  const [tagline, setTagline] = useState('');

  // Local state persisted to localStorage
  const [title, setTitle] = useLocalStorage('newWorkout_title', '');
  const [exercises, setExercises] = useLocalStorage('newWorkout_exercises', []);
  const [currentExercise, setCurrentExercise] = useLocalStorage('newWorkout_currentExercise', {name: '', musclegroup: '', description: '', sets: []});
  const [currentSet, setCurrentSet] = useLocalStorage('newWorkout_currentSet', { weight: '', reps: '' });
  const [started, setStarted] = useLocalStorage('newWorkout_started', false);
  const [startTime, setStartTime] = useLocalStorage('newWorkout_startTime', null);

  // Suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState([]);

  // Get unique exercises
  const uniqueExercises = useMemo(() => getUniqueExercises(workouts), [workouts]);

  // Most recent workout
  const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;

  // Ref to mark a click-selection
  const selectingRef = useRef(false);

  // Ref to container for click-outside
  const suggestionsContainerRef = useRef(null);
  
  // Reset workout state
  const resetWorkoutState = () => {
    setTitle('');
    setExercises([]);
    setCurrentExercise({ name: '', musclegroup: '', description: '', sets: [] });
    setCurrentSet({ weight: '', reps: '' });
    setStarted(false);
    setStartTime(null);
    localStorage.removeItem('newWorkout_title');
    localStorage.removeItem('newWorkout_exercises');
    localStorage.removeItem('newWorkout_currentExercise');
    localStorage.removeItem('newWorkout_currentSet');
    localStorage.removeItem('newWorkout_started');
    localStorage.removeItem('newWorkout_startTime');
  }

  // Filter suggestions when input changes
  useEffect(() => {
    if (selectingRef.current) {
      selectingRef.current = false;
      return;
    }

    const q = (currentExercise?.name || '').trim();
    if (!q) {
      if (filteredExercises.length > 0 || showSuggestions) {
        setFilteredExercises([]);
        setShowSuggestions(false);
      }
      return;
    }

    const normalizedQ = normaliseExercise(q).toLowerCase();

    const filtered = uniqueExercises.filter((ex) =>
      ex.name.toLowerCase().includes(normalizedQ)
    );

    // Only set state if it actually changed
    if (!arraysEqualByName(filtered, filteredExercises)) {
      setFilteredExercises(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [currentExercise?.name, uniqueExercises]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Initial data & taglines effect
  useEffect(() => {
    if (isError) {
      console.log(message);
    }
    if (!user) {
      navigate('/login');
      return;
    }

    dispatch(getWorkouts());

    let index = 0;
    setTagline(TAGLINES[index]);
    const interval = setInterval(() => {
      index = (index + 1) % TAGLINES.length;
      setTagline(TAGLINES[index]);
    }, 4000);

    return () => {
      clearInterval(interval);
      dispatch(reset());
    };
  }, [user, message, isError, navigate, dispatch]);

  // Select exercise from suggestions
  const selectExercise = (exercise) => {
    selectingRef.current = true;
    setShowSuggestions(false);
    setCurrentExercise((prev) => ({
      ...prev,
      name: exercise.name,
      musclegroup: exercise.musclegroup,
      description: exercise.description
    }));
  };

  // Change input for exercise fields
  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    setCurrentExercise((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Change input for set fields
  const handleSetChange = (e) => {
    const { name, value } = e.target;
    setCurrentSet((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add set to current exercise
  const addSet = () => {
    if (!currentSet.weight || currentSet.weight <= 0) {
      toast.error('Weight must be greater than 0.');
      return;
    }
    if (!currentSet.reps || currentSet.reps <= 0) {
      toast.error('Reps must be greater than 0.');
      return;
    }
    const weightInKg = parseWeight(currentSet.weight, user.useImperial);
    setCurrentExercise((prev) => ({
      ...prev,
      sets: [...(prev.sets || []), { weight: weightInKg, reps: Number(currentSet.reps) }]
    }));
    setCurrentSet({ weight: '', reps: '' });
    toast.success('Set saved successfully!');
  };

  // Add exercise to workout
  const addExercise = () => {
    if (!currentExercise.name.trim()) {
      toast.error('Please enter an exercise name.');
      return;
    }
    if (!currentExercise.musclegroup) {
      toast.error(`Please select a muscle group for exercise "${currentExercise.name}".`);
      return;
    }
    const normalizedExercise = {
      ...currentExercise,
      name: normaliseExercise(currentExercise.name)
    };
    setExercises((prev) => [...prev, normalizedExercise]);
    setCurrentExercise({ name: '', musclegroup: '', description: '', sets: [] });
    toast.success('Exercise saved successfully!');
  };

  // Submit Workout
  const onSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a workout title.');
      return;
    }
    if (exercises.length === 0) {
      toast.error('Please add at least one exercise.');
      return;
    }

    const endTime = Date.now();
    const durationMinutes = Math.round((endTime - startTime) / 60000);
    const workoutData = { title, exercises, duration: durationMinutes };

    try {
      // Save workout
      await dispatch(createWorkout(workoutData)).unwrap();
      toast.success('Workout saved successfully!');

      // Detect new PBs
      const newPBs = detectNewPBs(workoutData, workouts);
      if (newPBs.length > 0) {
        newPBs.forEach((pb) => {
          const oldWeightDisplay = formatWeight(pb.oldWeight, user.useImperial);
          const newWeightDisplay = formatWeight(pb.newWeight, user.useImperial);
          toast.success(`New PB for ${pb.exerciseName}! ${oldWeightDisplay} → ${newWeightDisplay}`);
        });
      }

      // Add fixed Strive Points (SP)
      const SP_AMOUNT = 200;
      const previousLevel = user.level;

      const spResult = await dispatch(addPoints({ userId: user._id, amount: SP_AMOUNT })).unwrap();

      toast.success(`+${SP_AMOUNT} Strive Points!`);

      if (spResult.level > previousLevel) {
        toast.success(`Level Up! You are now Level ${spResult.level}!`);
      }

      // Reset workout state & localStorage
      resetWorkoutState();

    } catch (error) {
      toast.error(error.message || 'Failed to save workout');
    }
  };

  // Cancel workout
  const onCancel = () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      resetWorkoutState();
      toast.success('Workout cancelled successfully');
    }
  };

  // Start workout
  const startWorkout = () => {
    if (user.isGuest && workouts.length >= 5) {
      toast.error('Guest accounts are limited to 5 workouts. Create a free Strive account for unlimited access!');
      return;
    }
    if (user.isGuest && workouts.length === 2) {
      toast.info('Enjoying Strive? Consider creating a free account for unlimited workouts!');
    }
    setStarted(true);
    setStartTime(Date.now());
  };

  if (isLoading || !user) {
    return <Spinner />;
  }

  return (
    <section className="bg-[#2B2D42] mt-15 min-h-screen flex flex-col items-center justify-start overflow-x-hidden">
      <Header />
      {user.isGuest && <GuestHeader currentWorkouts={workouts.length} />}
      <section className="w-full px-4 sm:px-0 flex flex-col items-center mt-6">
        {!started && (
          <div>
            <div className="text-6xl font-semibold text-[#EDF2F4]">
              <h1>
                Welcome back, <span className="text-[#EF233C]">{user.isGuest ? 'Guest' : user.username}</span>
              </h1>
              <p className="text-lg italic text-[#EDF2F4] text-center mb-6 transition-opacity duration-500">{tagline}</p>
            </div>
            {lastWorkout && (
              <div>
                <h2 className="text-[#EDF2F4] text-center text-xl mt-10">Last Session</h2>
                <WorkoutItem workout={lastWorkout} />
              </div>
            )}
          </div>
        )}

        <div className="p-6 w-full sm:max-w-2xl mx-auto bg-[#8D99AE] shadow rounded-2xl">
          {!started ? (
            <div>
              <h2 className="text-[#EDF2F4] text-xl text-center mb-3">Ready to train?</h2>
              <button onClick={startWorkout} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 px-4 rounded-xl hover:bg-[#D90429]">
                Start Workout
              </button>
            </div>
          ) : (
            <>
              <h1 className="new-workout text-2xl sm:text-3xl text-center text-[#EDF2F4] mb-5">
                - New <span className="text-[#EF233C]">Workout</span> -
              </h1>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Workout Title *"
                className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] text-center placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                required
              />

              {/* Exercise Form */}
              <div className="mb-4 bg-[#8D99AE] p-4 rounded-xl shadow-xl">
                <div className="relative" ref={suggestionsContainerRef}>
                  <input
                    type="text"
                    name="name"
                    value={currentExercise.name}
                    onChange={handleExerciseChange}
                    placeholder="Exercise Name *"
                    className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                    required
                  />

                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <ul
                      onClick={(e) => e.stopPropagation()}
                      className="absolute z-50 left-0 right-0 bg-[#2B2D42] border border-[#EF233C]/30 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
                    >
                      {filteredExercises.map((exercise, index) => (
                        <li
                          key={index}
                          onClick={() => selectExercise(exercise)}
                          className="px-4 py-2 text-[#EDF2F4] hover:bg-[#EF233C]/40 cursor-pointer"
                        >
                          <div className="font-semibold">{exercise.name}</div>
                          {exercise.musclegroup && <div className="text-sm text-[#8D99AE]">{exercise.musclegroup}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <select
                  name="musclegroup"
                  value={currentExercise.musclegroup}
                  onChange={handleExerciseChange}
                  className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                  required
                >
                  <option value="" className="placeholder-gray-300">
                    Select Muscle Group *
                  </option>
                  {MUSCLE_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="description"
                  value={currentExercise.description}
                  onChange={handleExerciseChange}
                  placeholder="Description"
                  className="w-full rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-4 py-2 mb-3 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                />

                {/* Sets Form */}
                <SetForm
                  currentSet={currentSet}
                  handleSetChange={handleSetChange}
                  addSet={addSet}
                  user={user}
                />

                {/* Sets List */}
                <SetList
                  sets={currentExercise.sets}
                  useImperial={user.useImperial}
                  onSetsUpdate={() => {
                    const updatedExercise = JSON.parse(localStorage.getItem('newWorkout_currentExercise'));
                    setCurrentExercise(updatedExercise);
                  }}
                />

                {/* Add Exercise */}
                <button type="button" onClick={addExercise} className="bg-[#EF233C] w-full text-white px-4 py-2 rounded transition hover:bg-[#D90429]">
                  Add Exercise
                </button>
              </div>

              {/* Exercises List */}
              <ExerciseList exercises={exercises} useImperial={user.useImperial} />

              {/* Submit Workout */}
              <div className="flex flex-col w-full items-center">
                <button onClick={onSubmit} className="w-full bg-[#EF233C] text-[#EDF2F4] py-2 rounded mt-4 transition hover:bg-[#D90429]">
                  End Workout
                </button>

                <button onClick={onCancel} className="w-1/2 bg-[#8D99AE] text-[#EDF2F4] py-2 rounded mt-2 transition hover:bg-[#D90429]">
                  Cancel Workout
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </section>
  );
};

export default NewWorkout;
