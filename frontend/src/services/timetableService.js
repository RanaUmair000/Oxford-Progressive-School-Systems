import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const API_URL = `${apiUrl}/api/timetable`;

// ============================================
// TIME SLOT SERVICES
// ============================================

export const createTimeSlot = async (data) => {
  const response = await axios.post(`${API_URL}/timeslots`, data);
  return response.data;
};

export const getAllTimeSlots = async () => {
  const response = await axios.get(`${API_URL}/timeslots`);
  return response.data;
};

export const getActiveTimeSlots = async () => {
  const response = await axios.get(`${API_URL}/timeslots/active`);
  return response.data;
};

export const updateTimeSlot = async (id, data) => {
  const response = await axios.put(`${API_URL}/timeslots/${id}`, data);
  return response.data;
};

export const deleteTimeSlot = async (id) => {
  const response = await axios.delete(`${API_URL}/timeslots/${id}`);
  console.log(response);
  return response.data;
};

export const bulkCreateTimeSlots = async (timeSlots) => {
  const response = await axios.post(`${API_URL}/timeslots/bulk`, { timeSlots });
  return response.data;
};

// ============================================
// TIMETABLE SERVICES
// ============================================

export const createTimetableEntry = async (data) => {
  const response = await axios.post(`${API_URL}/entries`, data);
  return response.data;
};

export const updateTimetableEntry = async (id, data) => {
  const response = await axios.put(`${API_URL}/entries/${id}`, data);
  return response.data;
};

export const deleteTimetableEntry = async (id) => {
  const response = await axios.delete(`${API_URL}/entries/${id}`);
  return response.data;
};

export const getWeeklyTimetableByClass = async (classId, academicYear) => {
  const response = await axios.get(`${API_URL}/class/${classId}`, {
    params: { academicYear }
  });
  return response.data;
};

export const getTeacherSchedule = async (teacherId, academicYear, day = null) => {
  const params = { academicYear };
  if (day) params.day = day;
  
  const response = await axios.get(`${API_URL}/teacher/${teacherId}`, { params });
  return response.data;
};

export const getTodayScheduleForClass = async (classId, academicYear) => {
  const response = await axios.get(`${API_URL}/today/class/${classId}`, {
    params: { academicYear }
  });
  return response.data;
};

export const getTodayScheduleForTeacher = async (teacherId, academicYear) => {
  const response = await axios.get(`${API_URL}/today/teacher/${teacherId}`, {
    params: { academicYear }
  });
  return response.data;
};

export const bulkCreateTimetable = async (entries, academicYear) => {
  const response = await axios.post(`${API_URL}/entries/bulk`, { entries, academicYear });
  return response.data;
};

export const copyTimetable = async (data) => {
  const response = await axios.post(`${API_URL}/copy`, data);
  return response.data;
};

export const getAllTimetableEntries = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/entries`, { params: filters });
  return response.data;
};

export const checkConflict = async (data) => {
  const response = await axios.post(`${API_URL}/check-conflict`, data);
  return response.data;
};

// ============================================
// HOLIDAY SERVICES
// ============================================

export const createHoliday = async (data) => {
  const response = await axios.post(`${API_URL}/holidays`, data);
  return response.data;
};

export const getAllHolidays = async (academicYear) => {
  const response = await axios.get(`${API_URL}/holidays`, {
    params: { academicYear }
  });
  return response.data;
};

export const getUpcomingHolidays = async (academicYear) => {
  const response = await axios.get(`${API_URL}/holidays`, {
    params: { academicYear, upcoming: true }
  });
  return response.data;
};

export const checkHoliday = async (date, academicYear) => {
  const response = await axios.get(`${API_URL}/holidays/check/${date}`, {
    params: { academicYear }
  });
  return response.data;
};

export const updateHoliday = async (id, data) => {
  const response = await axios.put(`${API_URL}/holidays/${id}`, data);
  return response.data;
};

export const deleteHoliday = async (id) => {
  const response = await axios.delete(`${API_URL}/holidays/${id}`);
  return response.data;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatTimeSlot = (timeSlot) => {
  if (!timeSlot) return '';
  return `${timeSlot.startTime} - ${timeSlot.endTime}`;
};

export const getDayColor = (day) => {
  const colors = {
    Monday: 'bg-blue-500',
    Tuesday: 'bg-green-500',
    Wednesday: 'bg-yellow-500',
    Thursday: 'bg-purple-500',
    Friday: 'bg-pink-500',
    Saturday: 'bg-orange-500',
    Sunday: 'bg-red-500'
  };
  return colors[day] || 'bg-gray-500';
};

export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Assuming academic year starts in August (month 7)
  if (month >= 7) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};