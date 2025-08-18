
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let data = JSON.parse(localStorage.getItem('users')) || {};

    // Simple validation
    if (data[email]) {
        alert('Account already exists!');
        return;
    }

    // Store the new user in localStorage
    data[email] = {password};
    localStorage.setItem('users', JSON.stringify(data));

    window.location.href = 'login.html';
});