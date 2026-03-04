/**
 * services/teachersApi.js
 * Centralized API service for Teacher Portal
 * Integrates with existing axios instance / auth setup
 */

import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

// Assumes your existing app already sets up axios with baseURL + auth interceptors
// If not, set it up here:
const api = axios.create({
  baseURL: `${apiUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
export const getDashboard = (academicYear) =>
  api.get('/teachers/dashboard', { params: { academicYear } });

// ─────────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────────
export const getTimetable = (academicYear) =>
  api.get('/teachers/timetable', { params: { academicYear } });

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────
export const getAssignedClasses = (academicYear) =>
  api.get('/teachers/classes', { params: { academicYear } });

export const getStudentsForAttendance = (classId, date) =>
  api.get(`/teachers/attendance/${classId}/students`, { params: { date } });

export const markAttendance = (data) =>
  api.post('/teachers/attendance', data);

export const getAttendanceByClass = (classId, month, year) =>
  api.get(`/teachers/attendance/${classId}`, { params: { month, year } });

// ─────────────────────────────────────────────
// ASSIGNMENTS
// ─────────────────────────────────────────────
export const getAssignments = (params) =>
  api.get('/teachers/assignments', { params });

export const createAssignment = (data) =>
  api.post('/teachers/assignments', data);

export const updateAssignment = (id, data) =>
  api.put(`/teachers/assignments/${id}`, data);

export const deleteAssignment = (id) =>
  api.delete(`/teachers/assignments/${id}`);

// ─────────────────────────────────────────────
// MARKS
// ─────────────────────────────────────────────
export const enterMarks = (data) =>
  api.post('/teachers/marks', data);

export const getMarksByClass = (classId, params) =>
  api.get(`/teachers/marks/${classId}`, { params });

// ─────────────────────────────────────────────
// LEAVE
// ─────────────────────────────────────────────
export const applyLeave = (data) =>
  api.post('/teachers/leave', data);

export const getLeaveRequests = (params) =>
  api.get('/teachers/leave', { params });

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const getNotifications = (params) =>
  api.get('/teachers/notifications', { params });

export const markAllNotificationsRead = () =>
  api.patch('/teachers/notifications/read-all');

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────
export const getProfile = () =>
  api.get('/teachers/profile');

export const updateProfile = (data) =>
  api.patch('/teachers/profile', data);
