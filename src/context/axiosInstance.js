import axios from 'axios';

const API_BASE_URL = 'https://advance-django-event.onrender.com';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// This is the magic part: an "interceptor"
// It runs BEFORE every request is sent.
axiosInstance.interceptors.request.use(
    config => {
        // Get the token from localStorage
        const authTokens = localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')) 
            : null;

        if (authTokens) {
            // If the token exists, add the Authorization header
            config.headers['Authorization'] = `Bearer ${authTokens.access}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;