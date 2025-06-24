import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('patient');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface LabTest {
  _id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  preparationInstructions?: string;
  sampleType: string;
  fastingRequired: boolean;
  availableSlots: Array<{
    day: string;
    times: string[];
  }>;
}

export interface Booking {
  _id: string;
  patient: string;
  labTest: LabTest;
  bookingDate: string;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentAmount: number;
  paymentMethod: string;
  confirmationNumber: string;
  testResults: {
    isReady: boolean;
    reportUrl?: string;
    resultDate?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    patient: Patient;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth API
export const authAPI = {
  register: async (patientData: Partial<Patient> & { password: string }): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', patientData);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ patient: Patient }>> => {
    const response: AxiosResponse<ApiResponse<{ patient: Patient }>> = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (patientData: Partial<Patient>): Promise<ApiResponse<{ patient: Patient }>> => {
    const response: AxiosResponse<ApiResponse<{ patient: Patient }>> = await api.put('/auth/profile', patientData);
    return response.data;
  },
};

// Lab Tests API
export const labTestsAPI = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ labTests: LabTest[] }>> => {
    const response: AxiosResponse<ApiResponse<{ labTests: LabTest[] }>> = await api.get('/tests', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ labTest: LabTest }>> => {
    const response: AxiosResponse<ApiResponse<{ labTest: LabTest }>> = await api.get(`/tests/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<{ categories: string[] }>> => {
    const response: AxiosResponse<ApiResponse<{ categories: string[] }>> = await api.get('/tests/categories/list');
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData: {
    labTest: string;
    bookingDate: string;
    timeSlot: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<ApiResponse<{ booking: Booking }>> => {
    const response: AxiosResponse<ApiResponse<{ booking: Booking }>> = await api.post('/bookings', bookingData);
    return response.data;
  },

  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ bookings: Booking[] }>> => {
    const response: AxiosResponse<ApiResponse<{ bookings: Booking[] }>> = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ booking: Booking }>> => {
    const response: AxiosResponse<ApiResponse<{ booking: Booking }>> = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<ApiResponse<{ booking: Booking }>> => {
    const response: AxiosResponse<ApiResponse<{ booking: Booking }>> = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  download: async (bookingId: string): Promise<any> => {
    const response = await api.get(`/reports/${bookingId}`);
    return response.data;
  },

  getStatus: async (bookingId: string): Promise<ApiResponse<{
    confirmationNumber: string;
    status: string;
    reportReady: boolean;
    resultDate?: string;
  }>> => {
    const response: AxiosResponse<ApiResponse<{
      confirmationNumber: string;
      status: string;
      reportReady: boolean;
      resultDate?: string;
    }>> = await api.get(`/reports/${bookingId}/status`);
    return response.data;
  },
};

export default api;
