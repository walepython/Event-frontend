// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://advance-django-event.onrender.com/api",
});

// Helper to get access token
const getAccessToken = () => {
  try {
    const authTokens = localStorage.getItem("authTokens");
    if (authTokens) {
      const parsed = JSON.parse(authTokens);
      console.log("Retrieved access token from authTokens:", parsed.access?.substring(0, 20) + "...");
      return parsed.access;
    }
  } catch (error) {
    console.error("Error parsing authTokens:", error);
  }
  return null;
};

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Request with token:", token.substring(0, 20) + "...");
    } else {
      console.warn("No access token found");
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor with refresh logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authTokens = localStorage.getItem("authTokens");
        if (!authTokens) throw new Error("No auth tokens");
        
        const parsed = JSON.parse(authTokens);
        const refreshToken = parsed.refresh;
        
        if (!refreshToken) throw new Error("No refresh token");
        
        const response = await axios.post(
          "https://advance-django-event.onrender.com/api/token/refresh/",
          { refresh: refreshToken }
        );
        
        const newAccessToken = response.data.access;
        const newTokens = {
          ...parsed,
          access: newAccessToken
        };
        
        localStorage.setItem("authTokens", JSON.stringify(newTokens));
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear auth tokens
        localStorage.removeItem("authTokens");
        // Redirect to login
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;