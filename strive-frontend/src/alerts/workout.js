// workout.js

import Swal from 'sweetalert2'

// Shield Used
export const showShieldUsedAlert = () => 
    Swal.fire({ 
        title: 'Shield Used!', 
        text: 'You missed your target last week, but your shield protected your streak!', 
        icon: 'warning', 
        confirmButtonText: 'Phew!', 
        color: '#EDF2F4', 
        background: '#8D99AE', 
        confirmButtonColor: '#EF233C' 
    })


export const showStreakBrokenAlert = (oldStreak) => 
    Swal.fire({ 
        title: 'Streak Lost!', 
        text: `Your ${oldStreak} week streak has been reset. Time to start again!`, 
        icon: 'error', 
        confirmButtonText: "Let's go again", 
        color: '#EDF2F4', 
        background: '#8D99AE', 
        confirmButtonColor: '#EF233C' 
    })


export const showMomentumDroppedAlert = (newMomentum) => 
    Swal.fire({ 
        title: 'Momentum Dropped!', 
        text: `Your momentum has decreased to ${newMomentum}. Time to get back on track.`, 
        icon: 'warning', 
        confirmButtonText: 'Got it', 
        color: '#EDF2F4', 
        background: '#8D99AE', 
        confirmButtonColor: '#EF233C' 
    })


export const showChangeExerciseAlert = (setCount) => 
    Swal.fire({
        title: 'Change Exercise?',
        text: `You have ${setCount} set(s) logged. Changing exercise will delete them.`,
        icon: 'warning',
        color: '#EDF2F4',
        background: '#8D99AE',
        showCancelButton: true,
        confirmButtonText: 'Change Exercise',
        cancelButtonText: 'Keep Current',
        confirmButtonColor: '#EF233C',
        cancelButtonColor: '#2B2D42',
    })


export const showRestCompleteAlert = () => 
    Swal.fire({
        title: 'Rest Complete!',
        text: 'Time for your next set. Get after it!',
        icon: 'success',
        color: '#EDF2F4',
        background: '#8D99AE',
        confirmButtonText: 'Lets Go!',
        confirmButtonColor: '#EF233C',
        timer: 10000,
        timerProgressBar: true,
    })


export const showCancelWorkoutAlert = () => 
    Swal.fire({
        title: 'Cancel Workout?',
        text: 'Are you sure you want to cancel this workout?',
        icon: 'warning',
        color: '#EDF2F4',
        background: '#8D99AE',
        showCancelButton: false,
        confirmButtonText: 'Confirm Cancel',
        confirmButtonColor: '#EF233C',
    })
