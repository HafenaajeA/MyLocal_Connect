import api, { handleApiError } from './api';
import toast from 'react-hot-toast';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Registration successful! Welcome to MyLocal Connect!');
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success(`Welcome back, ${response.data.user.firstName}!`);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Profile updated successfully!');
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/api/auth/change-password', passwordData);
      toast.success('Password changed successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      toast.success('Password reset email sent!');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/api/auth/verify-email', { token });
      toast.success('Email verified successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  },

  // Get stored user data
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check user role
  hasRole: (role) => {
    const user = authService.getStoredUser();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole('admin');
  },

  // Check if user is vendor
  isVendor: () => {
    return authService.hasRole('vendor');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/api/auth/refresh');
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
};
