import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface EmployeePayload {
  name: string;
  age: number;
  salary: string;
  yearsAtCompany: number;
  performanceRating: number;
  department: string;
}

export const loginUser = (payload: { usernameOrEmail: string; password: string }) => api.post('/auth/login', payload);
export const registerUser = (payload: { username: string; email: string; password: string; organizationName: string }) => api.post('/auth/register', payload);

// OTP-based auth
export const sendOtp = (payload: { email: string; purpose: 'LOGIN' | 'REGISTER'; usernameOrEmail?: string; password?: string; username?: string }) =>
  api.post('/auth/send-otp', payload);
export const verifyLogin = (payload: { usernameOrEmail: string; password: string; otp: string }) =>
  api.post('/auth/verify-login', payload);
export const verifyRegister = (payload: { username: string; email: string; password: string; organizationName: string; otp: string }) =>
  api.post('/auth/verify-register', payload);
export const getMe = () => api.get('/auth/me');

export const getCurrentUserProfile = () => api.get('/hr/me');
export const fetchHrProfile = () => api.get('/hr/me');
export const updateHrProfile = (payload: { avatarUrl?: string; role?: string }) => api.put('/hr/profile', payload);
export const deleteHrUser = (id: number) => api.delete(`/hr/users/${id}`);
export const updateOrganizationDetails = (payload: { name?: string; location?: string; industry?: string }) => api.put('/hr/organization', payload);

export const fetchEmployees = () => api.get('/employees');
export const fetchEmployeeDetails = (id: number) => api.get(`/employees/${id}/details`);
export const simulateRisk = (payload: any) => api.post('/employees/simulate', payload);
export const createEmployee = (payload: EmployeePayload) => api.post('/employees', payload);
export const updateEmployee = (id: number, payload: EmployeePayload) => api.put(`/employees/${id}`, payload);
export const deleteEmployee = (id: number) => api.delete(`/employees/${id}`);
export const uploadEmployeesCsv = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/employees/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const fetchOrganizations = () => api.get('/hr/organizations');
export const createOrganization = (payload: { name: string; industry?: string; location?: string }) => api.post('/hr/organizations', payload);
export const fetchTradeListings = () => api.get('/hr/trade-listings');
export const createTradeListing = (payload: { employeeId: number; commissionPercent: number; notes: string }) => api.post('/hr/trade-listings', payload);
export const claimTradeListing = (id: number) => api.post(`/hr/trade-listings/${id}/claim`);
export const fetchHrUsers = () => api.get('/hr/users');
export const fetchMessages = () => api.get('/hr/messages');
export const sendMessage = (payload: { recipientId: number; content: string }) => api.post('/hr/messages', payload);

export const fetchIndividualEmployeeAiAnalysis = (id: number) => api.get(`/gemini/employee/${id}`);
export const fetchWorkforceAiAnalytics = () => api.get('/gemini/workforce');
