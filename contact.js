document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentUser').textContent = localStorage.getItem('currentUser') || 'Guest'; // Display current user
});
