// ============================================
// API Service Layer for Frontend
// ============================================
const apiUrl = import.meta.env.VITE_API_URL;

const API_BASE_URL = `${apiUrl}/api`;

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
};

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  /**
   * Mark bulk attendance for multiple students
   */
  markBulkAttendance: async (attendanceData) => {
    try {
      const response = await fetch(`${apiUrl}/api/attendance/mark-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Mark attendance for a single student
   */
  markAttendance: async (studentAttendance) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentAttendance)
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get attendance by date for a class/section
   */
  getAttendanceByDate: async (date, classId, section) => {
    try {
      const params = new URLSearchParams({ date, classId, section });
      const response = await fetch(`${API_BASE_URL}/attendance/by-date?${params}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get attendance history for a student
   */
  getStudentAttendance: async (studentId, startDate = null, endDate = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(
        `${API_BASE_URL}/attendance/student/${studentId}?${params}`
      );
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get monthly attendance report
   */
  getMonthlyReport: async (month, year, classId, section) => {
    try {
      const params = new URLSearchParams({ month, year, classId, section });
      const response = await fetch(`${API_BASE_URL}/attendance/monthly-report?${params}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get defaulters list
   */
  getDefaulters: async (threshold = 75, month = null, year = null, classId = null, section = null) => {
    try {
      const params = new URLSearchParams({ threshold: threshold.toString() });
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (classId) params.append('classId', classId);
      if (section) params.append('section', section);
      
      const response = await fetch(`${API_BASE_URL}/attendance/defaulters?${params}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get class-wise statistics
   */
  getClassWiseStats: async (date = null) => {
    try {
      const params = date ? new URLSearchParams({ date }) : '';
      const response = await fetch(`${API_BASE_URL}/attendance/class-stats?${params}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update attendance record
   */
  updateAttendance: async (attendanceId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete attendance record
   */
  deleteAttendance: async (attendanceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}`, {
        method: 'DELETE'
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};

// ============================================
// STUDENT API
// ============================================

export const studentAPI = {
  /**
   * Get all students or filter by query
   */
  getStudents: async (classId = null, section = null, status = 'Active') => {
    try {
      const params = new URLSearchParams();
      if (classId) params.append('classId', classId);
      if (section) params.append('section', section);
      if (status) params.append('status', status);
      
      const response = await fetch(`${API_BASE_URL}/students?${params}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get a single student by ID
   */
  getStudentById: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create a new student
   */
  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update a student
   */
  updateStudent: async (studentId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete a student (soft delete)
   */
  deleteStudent: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE'
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};

// ============================================
// CLASS API
// ============================================

export const classAPI = {
  /**
   * Get all classes
   */
  getClasses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get a single class by ID
   */
  getClassById: async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}`);
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create a new class
   */
  createClass: async (classData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData)
      });
      return await handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const utils = {
  /**
   * Format date to YYYY-MM-DD
   */
  formatDate: (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Get month name from number
   */
  getMonthName: (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  },

  /**
   * Calculate attendance percentage
   */
  calculatePercentage: (present, total) => {
    if (total === 0) return 0;
    return ((present / total) * 100).toFixed(2);
  },

  /**
   * Get status color
   */
  getStatusColor: (status) => {
    const colors = {
      Present: '#10b981',
      Absent: '#ef4444',
      Leave: '#f59e0b',
      Late: '#8b5cf6',
      Holiday: '#6b7280'
    };
    return colors[status] || '#6b7280';
  },

  /**
   * Get percentage color
   */
  getPercentageColor: (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#f59e0b';
    return '#ef4444';
  },

  /**
   * Export to CSV
   */
  exportToCSV: (data, filename) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

export default {
  attendanceAPI,
  studentAPI,
  classAPI,
  utils
};