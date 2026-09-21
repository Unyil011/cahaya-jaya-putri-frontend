import axios from 'axios';

const api = axios.create({
    baseURL: '/backend', // Relative path for InfinityFree
    withCredentials: true,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor to attach the Sanctum token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



export default api;
