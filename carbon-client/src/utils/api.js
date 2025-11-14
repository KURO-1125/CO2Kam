import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token will be set via setAuthToken function
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - token may be expired');
      // Could trigger logout here if needed
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Emission calculations
  calculateEmissions: (activity, value) => 
    api.post('/api/calculate', { activity, value }),

  // Emission entries
  getEmissionEntries: () => api.get('/api/entries'),
  
  logEmissionEntry: (entryData) => 
    api.post('/api/log', entryData),

  // User profile
  getUserProfile: () => api.get('/api/user/profile'),
  
  updateUserProfile: (profileData) => 
    api.put('/api/user/profile', profileData),

  // User statistics
  getUserStats: () => api.get('/api/user/stats'),

  // Carbon offset projects
  getOffsetProjects: () => api.get('/api/offsets'),
};

export default api;