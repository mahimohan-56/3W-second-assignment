import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Payment API
export const paymentAPI = {
  // Get all user's payment methods
  getPayments: () => api.get('/payments'),
  
  // Get single payment method
  getPayment: (id) => api.get(`/payments/${id}`),
  
  // Create new payment method
  createPayment: (data) => api.post('/payments', data),
  
  // Update payment method
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  
  // Delete payment method
  deletePayment: (id) => api.delete(`/payments/${id}`),
};

// Admin API
export const adminAPI = {
  // Get all users
  getAllUsers: () => api.get('/admin/users'),
  
  // Get all payment methods from all users
  getAllPayments: () => api.get('/admin/payments'),
  
  // Get payment methods for specific user
  getUserPayments: (userId) => api.get(`/admin/users/${userId}/payments`),
  
  // Search and filter payments
  searchPayments: (params) => api.get('/admin/payments/search', { params }),
};

export default api;
