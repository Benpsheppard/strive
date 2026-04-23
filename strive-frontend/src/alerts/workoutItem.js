// workoutItem.js

import Swal from 'sweetalert2'

export const showConfirmDeleteAlert = () =>
    Swal.fire({
        title: 'Delete Workout?',
        text: 'Are you sure you want to delete this workout? You will lose all associated data as well as any Strive Points earned from it.',
        icon: 'warning',
        color: '#EDF2F4',
        background: '#8D99AE',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF233C',
        cancelButtonColor: '#2B2D42'
    })