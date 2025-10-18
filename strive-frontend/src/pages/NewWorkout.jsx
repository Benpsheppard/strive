// NewWorkout.jsx

// Imports
import { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import { createWorkout, getWorkouts, reset } from '../features/workouts/workoutsSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { detectNewPBs } from '../utils/pbDetection.js';
import { parseWeight, formatWeight, getWeightUnit } from '../utils/weightUnits.js';

import Header from '../components/headers/Header.jsx';
import WorkoutItem from '../components/workouts/WorkoutItem.jsx';
import Spinner from '../components/Spinner.jsx';
import SetList from '../components/workouts/SetList.jsx';
import GuestHeader from '../components/headers/GuestHeader.jsx';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const jsonValue = localStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

// New Workout
const NewWorkout = () => {
  // redux / routing
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { workouts = [], isLoading, isError, message } = useSelector((state) => state.workout);
  const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;

  // Taglines
  const taglines = [
    'Consistency builds strength',
    'One more rep, one step closer',
    'No excuses, just results',
    'Push your limits',
    'Strive for progress, not perfection'
  ];
  const [tagline, setTagline] = useState('');

  // Muscle groups
  const muscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Arms',
    'Legs',
    'Core',
    'Full body',
    'Other'
  ];

  // Normalise helper
  const normaliseExercise = (name = '') =>
    name
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');

  // Compute uniqueExercises from workouts
  const uniqueExercises = useMemo(() => {
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
  }, [workouts]);

  // Local state persisted to localStorage
  const [title, setTitle] = useLocalStorage('newWorkout_title', '');
  const [exercises, setExercises] = useLocalStorage('newWorkout_exercises', []);
  const [currentExercise, setCurrentExercise] = useLocalStorage('newWorkout_currentExercise', {
    name: '',
    musclegroup: '',
    description: '',
    sets: []
  });
  const [currentSet, setCurrentSet] = useLocalStorage('newWorkout_currentSet', { weight: '', reps: '' });
  const [started, setStarted] = useLocalStorage('newWorkout_started', false);
  const [startTime, setStartTime] = useLocalStorage('newWorkout_startTime', null);

  // Suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState([]);

  // Ref to mark a click-selection
  const selectingRef = useRef(false);

  // Ref to container for click-outside
  const suggestionsContainerRef = useRef(null);

  // Utility to compare exercise arrays by name
  const arraysEqualByName = (a = [], b = []) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].name !== b[i].name) return false;
    }
    return true;
  };

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
  }, [currentExercise?.name, uniqueExercises]); // stable deps

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

  // Select exercise from suggestions
  const selectExercise = (exercise) => {
    // mark that selection is happening
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

  // Submit workout
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
      await dispatch(createWorkout(workoutData)).unwrap();
      toast.success('Workout saved successfully!');

      const newPBs = detectNewPBs(workoutData, workouts);
      if (newPBs.length > 0) {
        newPBs.forEach((pb) => {
          const oldWeightDisplay = formatWeight(pb.oldWeight, user.useImperial);
          const newWeightDisplay = formatWeight(pb.newWeight, user.useImperial);
          toast.success(`New PB for ${pb.exerciseName}! ${oldWeightDisplay} → ${newWeightDisplay}`);
        });
      }

      // Reset states and localStorage
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
    } catch (error) {
      toast.error(error.message || 'Failed to save workout');
    }
  };

  // Cancel workout
  const onCancel = () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
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

  // initial data & taglines effect
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
    setTagline(taglines[index]);
    const interval = setInterval(() => {
      index = (index + 1) % taglines.length;
      setTagline(taglines[index]);
    }, 4000);

    return () => {
      clearInterval(interval);
      dispatch(reset());
    };
  }, [user, message, isError, navigate, dispatch]); // kept same as original

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
                  {muscleGroups.map((group) => (
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
                <div className="flex flex-col gap-2 mb-3 px-4 py-2 w-full shadow-lg rounded-lg">
                  {/* Inputs row */}
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="number"
                      name="weight"
                      value={currentSet.weight}
                      onChange={handleSetChange}
                      placeholder={`Weight (${getWeightUnit(user.useImperial)})`}
                      className="flex-1 min-w-0 rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-3 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                    />
                    <input
                      type="number"
                      name="reps"
                      value={currentSet.reps}
                      onChange={handleSetChange}
                      placeholder="Reps"
                      className="flex-1 min-w-0 rounded-lg border border-[#EDF2F4]/40 bg-[#2B2D42] px-3 py-2 text-[#EDF2F4] placeholder-gray-300 focus:border-[#EF233C] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/40"
                    />

                    {/* Desktop + Button */}
                    <button type="button" onClick={addSet} className="hidden sm:flex w-10 h-10 items-center justify-center bg-[#EF233C] text-white rounded-lg transition hover:bg-[#D90429]">
                      <FaPlus />
                    </button>
                  </div>

                  {/* Mobile Add Set Button */}
                  <button type="button" onClick={addSet} className="sm:hidden w-full bg-[#EF233C] text-white py-2 rounded transition hover:bg-[#D90429]">
                    Add Set
                  </button>
                </div>

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
              <div className="max-h-64 overflow-y-auto mb-4">
                {exercises.map((ex, i) => (
                  <div key={i} className="bg-[#8D99AE] p-2 rounded-lg mb-2 text-center shadow-lg">
                    <h4 className="font-bold text-[#EF233C]">{ex.name}</h4>
                    <p className="text-[#EDF2F4]">
                      {ex.musclegroup} — {ex.description}
                    </p>
                    <ul>
                      {ex.sets.map((s, idx) => (
                        <li className="text-[#2B2D42]" key={idx}>
                          - {formatWeight(s.weight, user.useImperial)} × {s.reps} reps
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

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
