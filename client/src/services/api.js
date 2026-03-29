import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── AI Agent ──────────────────────────────────────────────
export const uploadPDF = (formData) =>
  api.post('/ai/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const askQuestion = (question) =>
  api.post('/ai/ask', { question });

export const getDocumentStatus = () => api.get('/ai/status');

export const clearDocument = () => api.delete('/ai/document');

// ── Reminders ─────────────────────────────────────────────
export const getReminders = (params) => api.get('/reminders', { params });

export const createReminder = (data) => api.post('/reminders', data);

export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data);

export const deleteReminder = (id) => api.delete(`/reminders/${id}`);

export const toggleReminder = (id) => api.patch(`/reminders/${id}/toggle`);

export default api;
