import axios from 'axios';

// Base Axios instance configured for the FastAPI backend
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Update based on deployment later
  timeout: 10000,
});

// Interceptor to uniformly handle the { success: true/false } response shape
apiClient.interceptors.response.use(
  (response) => {
    // If our custom backend returns success: true, unwrap the data directly
    if (response.data && response.data.success) {
      return response.data.data;
    }
    // Fallback for standard endpoints or un-wrapped responses
    return response.data;
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else {
      console.error('Network or CORS error:', error.message);
    }
    return Promise.reject(error);
  }
);
