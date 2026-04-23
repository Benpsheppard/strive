// profile.js

import Swal from 'sweetalert2'

export const showDeleteAccountAlert = () =>
    Swal.fire({
        title: 'Delete Account?',
        html: 'This will permanently delete all your workouts and data. This action cannot be undone.<br><br>Type <strong>DELETE</strong> to confirm.',
        icon: 'warning',
        color: '#EDF2F4',
        background: '#8D99AE',
        input: 'text',
        inputPlaceholder: 'Type DELETE to confirm',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF233C',
        cancelButtonColor: '#2B2D42',
        preConfirm: (value) => {
            if (value !== 'DELETE') {
                Swal.showValidationMessage('You must type DELETE exactly to confirm')
                return false
            }
        }
    })

export const showLogoutAccountAlert = () => 
    Swal.fire({
        title: 'Log Out?',
        text: 'Are you sure you want to log out?',
        icon: 'warning',
        color: '#EDF2F4',
        background: '#8D99AE',
        showCancelButton: true,
        confirmButtonText: 'Logout',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF233C',
        cancelButtonColor: '#2B2D42'
    })

export const showResetAccountAlert = () =>
    Swal.fire({
        title: 'Reset Account?',
        html: 'This will permanently delete your workout data but keep your profile intact. This action cannot be undone.<br><br>Type <strong>RESET</strong> to confirm.',
        icon: 'warning',
        color: '#EDF2F4',
        background: '#8D99AE',
        input: 'text',
        inputPlaceholder: 'Type RESET to confirm',
        showCancelButton: true,
        confirmButtonText: 'Reset',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF233C',
        cancelButtonColor: '#2B2D42',
        preConfirm: (value) => {
            if (value !== 'RESET') {
                Swal.showValidationMessage('You must type RESET exactly to confirm')
                return false
            }
        }
    })