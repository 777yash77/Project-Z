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
  designation?: string;
  employeeCode?: string;
}

// ─── Legacy & Core Auth ──────────────────────────────────────────────
export const loginUser = (payload: { usernameOrEmail: string; password: string }) => api.post('/auth/login', payload);
export const registerUser = (payload: { username: string; email: string; password: string; organizationName: string }) => api.post('/auth/register', payload);

export const sendOtp = (payload: { email: string; purpose: 'LOGIN' | 'REGISTER'; usernameOrEmail?: string; password?: string; username?: string }) =>
  api.post('/auth/send-otp', payload);
export const verifyLogin = (payload: { usernameOrEmail: string; password: string; otp: string }) =>
  api.post('/auth/verify-login', payload);
export const verifyRegister = (payload: { username: string; email: string; password: string; organizationName: string; role?: string; otp: string }) =>
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
export const fetchEmployeeImpactAnalysis = (id: number) => api.get(`/gemini/employee/${id}/impact`);
export const fetchWorkforceAiAnalytics = () => api.get('/gemini/workforce');

// ─── Organisation Portal APIs ───────────────────────────────────────────
export const createHrAccount = (payload: { username: string; email: string }) => api.post('/org/hr', payload);
export const fetchHrAccounts = () => api.get('/org/hr');
export const updateHrAccountStatus = (id: number, type: 'active' | 'suspended' | 'approved', value: boolean) =>
  api.put(`/org/hr/${id}/status`, { type, value });
export const resetHrPassword = (id: number) => api.post(`/org/hr/${id}/reset-password`);
export const fetchAuditLogs = () => api.get('/org/audit-logs');
export const fetchDepartments = () => api.get('/org/departments');
export const createDepartment = (payload: { name: string; code: string; description?: string }) => api.post('/org/departments', payload);
export const fetchDesignations = () => api.get('/org/designations');
export const createDesignation = (payload: { title: string; gradeLevel?: string }) => api.post('/org/designations', payload);

// ─── Indian Trading Window & Rule Engine APIs ───────────────────────────
export const saveTradingWindowConfig = (payload: any) => api.post('/trading/config', payload);
export const fetchTradingWindowConfig = () => api.get('/trading/config');
export const evaluateTransferEligibility = (payload: { employeeId: number; targetOrgId: number }) => api.post('/trading/evaluate', payload);
export const createTransferRequest = (payload: { employeeId: number; targetOrgId: number; targetDepartment?: string; targetDesignation?: string; reason?: string }) =>
  api.post('/trading/requests', payload);
export const fetchTransferRequests = () => api.get('/trading/requests');
export const approveTransferStep = (id: number) => api.post(`/trading/requests/${id}/approve`);

// ─── LinkedIn Social Feed & Networking APIs ──────────────────────────────
export const fetchFeed = () => api.get('/feed');
export const createPost = (payload: { content: string; postType?: string; mediaUrl?: string; visibility?: string }) => api.post('/feed/posts', payload);
export const editPost = (id: number, payload: { content: string }) => api.put(`/feed/posts/${id}`, payload);
export const deletePost = (id: number) => api.delete(`/feed/posts/${id}`);
export const togglePostLike = (id: number) => api.post(`/feed/posts/${id}/like`);
export const sharePost = (id: number) => api.post(`/feed/posts/${id}/share`);
export const addPostComment = (id: number, payload: { content: string; parentCommentId?: number }) => api.post(`/feed/posts/${id}/comments`, payload);
export const fetchPostComments = (id: number) => api.get(`/feed/posts/${id}/comments`);
export const sendConnectionRequest = (userId: number) => api.post(`/network/connect/${userId}`);
export const toggleFollow = (userId: number) => api.post(`/network/follow/${userId}`);
export const respondConnectionRequest = (id: number, status: 'ACCEPTED' | 'REJECTED') => api.post(`/network/requests/${id}/respond`, { status });
export const fetchPendingConnectionRequests = () => api.get('/network/requests');
export const fetchNotifications = () => api.get('/notifications');

// ─── Rich Employee Profile APIs ──────────────────────────────────────────
export const fetchMyProfile = () => api.get('/profile/me');
export const updateBio = (payload: any) => api.put('/profile/bio', payload);
export const addExperience = (payload: any) => api.post('/profile/experience', payload);
export const addEducation = (payload: any) => api.post('/profile/education', payload);
export const addSkill = (skillName: string) => api.post('/profile/skills', { skillName });
export const addDocument = (payload: { documentName: string; documentType?: string; fileUrl: string }) => api.post('/profile/documents', payload);
export const addAward = (payload: any) => api.post('/profile/awards', payload);
export const addCertification = (payload: any) => api.post('/profile/certifications', payload);
export const fetchMyPosts = () => api.get('/feed/my-posts');

// ─── Utility ─────────────────────────────────────────────────────────────
export const getBase64 = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        let width = img.width;
        let height = img.height;
        if (scaleSize < 1) {
          width = maxWidth;
          height = img.height * scaleSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
