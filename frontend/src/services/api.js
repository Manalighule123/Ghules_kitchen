import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach demo token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ghules_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: (userId = 1) => api.get(`/auth/me?user_id=${userId}`),
};

export const kitchensAPI = {
  getAll: () => api.get('/kitchens'),
  getById: (id) => api.get(`/kitchens/${id}`),
  getCapacity: (id) => api.get(`/kitchens/${id}/capacity`),
  getOverload: (id) => api.get(`/kitchens/${id}/overload`),
  getAvailableCooks: (id) => api.get(`/kitchens/${id}/available-cooks`),
  getMenu: (id) => api.get(`/kitchens/${id}/menu`),
  addMenuItem: (kitchenId, data) => api.post(`/kitchens/${kitchenId}/menu`, data),
  deleteMenuItem: (itemId) => api.delete(`/kitchens/menu/${itemId}`),
};

export const cooksAPI = {
  getAll: () => api.get('/cooks'),
  getById: (id) => api.get(`/cooks/${id}`),
  updateAvailability: (id, data) => api.put(`/cooks/${id}/availability`, data),
  updateProfile: (id, data) => api.put(`/cooks/${id}/profile`, data),
  verifyCook: (id, data) => api.put(`/cooks/${id}/verify`, data),
  getAssignments: (id) => api.get(`/cooks/${id}/assignments`),
};

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data, customerId = 4) => api.post(`/orders?customer_id=${customerId}`, data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  updateAssignmentStatus: (assignmentId, status, rejectionReason = null) => 
    api.put('/orders/assignment/status', { assignment_id: assignmentId, status, rejection_reason: rejectionReason }),
};

export const aiAPI = {
  matchCooks: (kitchenId) => api.post(`/ai/match-cook?kitchen_id=${kitchenId}`),
  allocateOrders: (kitchenId, orderId = null, maxOrders = null) => 
    api.post('/ai/allocate-orders', { kitchen_id: kitchenId, order_id: orderId, max_orders_to_allocate: maxOrders }),
  parseResponse: (text, cookId = null) => api.post('/ai/parse-response', { text, cook_id: cookId }),
  askAssistant: (query, kitchenId = null, userRole = 'ADMIN') => api.post('/ai/assistant', { query, kitchen_id: kitchenId, user_role: userRole }),
  recognizeFood: (formData) => api.post('/ai/recognize-food', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  calculateContribution: (params) => api.get('/ai/calculate-contribution', { params }),
  partnerChat: (data) => api.post('/ai/partner-chat', data),
  getPartnerConversations: () => api.get('/ai/partner-conversations'),
  approvePartnerConversation: (id) => api.post(`/ai/partner-conversations/${id}/approve`),
};

export const voiceAPI = {
  simulateCall: (cookId, incomingText) => api.post('/voice/simulate', { cook_id: cookId, incoming_text: incomingText }),
};

export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data, customerId = 4) => api.post('/reviews', data, { params: { customer_id: customerId } }),
};

export const complaintsAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  file: (data, customerId = 4) => api.post('/complaints', data, { params: { customer_id: customerId } }),
  resolve: (id, data) => api.put(`/complaints/${id}/resolve`, data),
};

export const packagingAPI = {
  getAll: (kitchenId = 1) => api.get('/packaging', { params: { kitchen_id: kitchenId } }),
  create: (data) => api.post('/packaging', data),
  updateStock: (id, data) => api.put(`/packaging/${id}`, data),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const notificationsAPI = {
  getAll: (userId) => api.get('/notifications', { params: { user_id: userId } }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const analyticsAPI = {
  getStats: () => api.get('/analytics'),
};

export default api;
