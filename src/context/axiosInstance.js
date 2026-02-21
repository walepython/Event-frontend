import axios from 'axios';

const API_BASE_URL = 'https://advance-django-event.onrender.com/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const authTokens = JSON.parse(localStorage.getItem('authTokens'));
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/token/refresh/`,
                    { refresh: authTokens.refresh },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                
                if (refreshResponse.data.access) {
                    authTokens.access = refreshResponse.data.access;
                    localStorage.setItem('authTokens', JSON.stringify(authTokens));
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;