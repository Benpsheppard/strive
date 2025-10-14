// authService.js

// Imports
import axios from 'axios';

const API_URL = '/api/users/';

// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL, userData);

    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);

    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
}

// Delete user
const deleteUser = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.delete(API_URL + userId, config);

    if (response.data) {
        localStorage.removeItem('user');  // Remove user from localStorage
    }

    return response.data;
}

// Reset user
const resetUser = async (userId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const response = await axios.delete(API_URL + userId, config);

    return response.data;
}

// Export functions
const authService = {
    register,
    logout,
    login,
    deleteUser,
    resetUser
}

export default authService;