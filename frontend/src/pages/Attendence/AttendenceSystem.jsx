import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, BarChart3, FileText, Search, Mail, Filter, Download, ChevronLeft, ChevronRight, X, Check, AlertCircle, TrendingUp, TrendingDown, Phone  } from 'lucide-react';
import axios from 'axios';
import { attendanceAPI } from './api_service';

const apiUrl = import.meta.env.VITE_API_URL;

// Mock API service - Replace with actual API calls
const API = {
  async getAttendance(date, classId, section) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const key = `${date}-${classId}-${section}`;
    return mockAttendance[key] || [];
  },

  async markAttendance(attendanceData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const key = `${attendanceData.date}-${attendanceData.classId}-${attendanceData.section}`;
    mockAttendance[key] = attendanceData.records;
    return { success: true, message: 'Attendance marked successfully' };
  },

  async getStudentReport(studentId, month, year) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return calculateStudentReport(studentId, month, year);
  }
};

// const mockStudents = [
//   { _id: '1', rollNumber: '001', firstName: 'Aarav', lastName: 'Sharma', classId: '1', section: 'A', status: 'Active' },
//   { _id: '2', rollNumber: '002', firstName: 'Aditi', lastName: 'Patel', classId: '1', section: 'A', status: 'Active' },
//   { _id: '3', rollNumber: '003', firstName: 'Arjun', lastName: 'Kumar', classId: '1', section: 'A', status: 'Active' },
//   { _id: '4', rollNumber: '004', firstName: 'Diya', lastName: 'Gupta', classId: '1', section: 'A', status: 'Active' },
//   { _id: '5', rollNumber: '005', firstName: 'Ishaan', lastName: 'Singh', classId: '1', section: 'A', status: 'Active' },
//   { _id: '6', rollNumber: '006', firstName: 'Kavya', lastName: 'Reddy', classId: '1', section: 'B', status: 'Active' },
//   { _id: '7', rollNumber: '007', firstName: 'Rohan', lastName: 'Verma', classId: '1', section: 'B', status: 'Active' },
//   { _id: '8', rollNumber: '008', firstName: 'Sanya', lastName: 'Joshi', classId: '1', section: 'B', status: 'Active' },
//   { _id: '9', rollNumber: '009', firstName: 'Vivaan', lastName: 'Agarwal', classId: '2', section: 'A', status: 'Active' },
//   { _id: '10', rollNumber: '010', firstName: 'Ananya', lastName: 'Nair', classId: '2', section: 'A', status: 'Active' }
// ];

const mockAttendance = {};

// Utility Functions
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};

const calculateStudentReport = (studentId, month, year) => {
  const workingDays = 22;
  const present = Math.floor(Math.random() * 3) + 19;
  const absent = Math.floor(Math.random() * 3);
  const leave = Math.floor(Math.random() * 2);

  return {
    studentId,
    month,
    year,
    totalPresent: present,
    totalAbsent: absent,
    totalLeave: leave,
    workingDays,
    attendancePercentage: (present / workingDays * 100).toFixed(2),
    dailyRecords: Array.from({ length: workingDays }, (_, i) => ({
      date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      status: ['Present', 'Absent', 'Leave'][Math.floor(Math.random() * 10) > 1 ? 0 : Math.floor(Math.random() * 2) + 1]
    }))
  };
};

// Main App Component
export default function AttendanceManagementSystem() {
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [mockStudents, setMockStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchAllStudents = async (classId = "") => {
    try {
      setLoading(true);

      const res = await axios.get(`${apiUrl}/api/students`, {
        params: classId ? { classId } : {}
      });
      setMockStudents(res.data.students);
      setTotalStudents(res.data.totalStudents);

    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, [])
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 100%)',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <div style={{ marginLeft: '280px', padding: '32px' }}>
        {activeView === 'dashboard' && <Dashboard showNotification={showNotification} />}
        {activeView === 'mark' && <MarkAttendance showNotification={showNotification} />}
        {activeView === 'monthly' && <MonthlyView showNotification={showNotification} />}
        {activeView === 'reports' && <ReportsView showNotification={showNotification} />}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        aside{
          display: none !important;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          animation: fadeIn 0.4s ease-out;
        }
        
        input:focus, select:focus, button:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        button {
          transition: all 0.2s ease;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

// Sidebar Component
function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'mark', label: 'Mark Attendance', icon: Calendar },
    { id: 'monthly', label: 'Monthly View', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '280px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '32px 20px',
      boxShadow: '4px 0 12px rgba(0,0,0,0.03)'
    }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          Attendance Pro
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          School Management System
        </p>
      </div>

      <nav>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '12px',
                background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                color: isActive ? 'white' : '#6b7280',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Dashboard Component
function Dashboard({ showNotification }) {
  const [stats, setStats] = useState({
    presentToday: 231,
    absentToday: 10,
    onLeave: 4,
    avgAttendance: 94.3
  });

  const [recentActivity, setRecentActivity] = useState([
    { date: '2026-02-04', class: 'Class 1-A', marked: true, percentage: 96.5 },
    { date: '2026-02-04', class: 'Class 2-A', marked: true, percentage: 92.3 },
    { date: '2026-02-03', class: 'Class 1-A', marked: true, percentage: 94.1 },
    { date: '2026-02-03', class: 'Class 3-B', marked: true, percentage: 88.7 }
  ]);

  const [mockStudents, setMockStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAllStudents = async (classId = "") => {
    try {
      setLoading(true);

      const res = await axios.get(`${apiUrl}/api/students`, {
        params: classId ? { classId } : {}
      });
      setMockStudents(res.data.data);
      setTotalStudents(res.data.data.length);


    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Dashboard Overview
        </h2>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Track attendance metrics and insights at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={Users}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          label="Present Today"
          value={stats.presentToday}
          icon={Check}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="+2.3%"
        />
        <StatCard
          label="Absent Today"
          value={stats.absentToday}
          icon={X}
          color="#ef4444"
          bgColor="#fef2f2"
          trend="-1.2%"
        />
        <StatCard
          label="Average Attendance"
          value={`${stats.avgAttendance}%`}
          icon={TrendingUp}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
      </div>

      {/* Recent Activity */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
          Recent Attendance Records
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Class</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((record, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151' }}>
                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {record.class}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: '#ecfdf5',
                      color: '#10b981'
                    }}>
                      Marked
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: record.percentage >= 90 ? '#10b981' : '#f59e0b' }}>
                    {record.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor, trend }) {
  return (
    <div className="card" style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
        {trend && (
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: trend.startsWith('+') ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {trend.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
          {label}
        </p>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function MarkAttendance({ showNotification }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  // Fetch all classes on component mount
  useEffect(() => {
    fetchAllClasses();
  }, []);

  // Fetch students and attendance when class, or date changes
  useEffect(() => {
    if (selectedClass) {
      loadStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchAllClasses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/classes`);
      setClasses(res.data.data || res.data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
      showNotification('Error loading classes', 'error');
    }
  };

  const loadStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch attendance by date
      const response = await axios.get(`${apiUrl}/api/attendance/by-date`, {
        params: {
          date: selectedDate,
          classId: selectedClass,
        }
      });

      if (response.data.success) {
        const { data: studentAttendanceList, attendanceMarked: isMarked } = response.data;

        // Extract students
        const studentList = studentAttendanceList.map(item => item.student);
        setStudents(studentList);

        // Build attendance map
        const attendanceMap = {};
        studentAttendanceList.forEach(item => {
          if (item.attendance) {
            attendanceMap[item.student._id] = {
              status: item.attendance.status,
              remarks: item.attendance.remarks || '',
              attendanceId: item.attendance._id
            };
          } else {
            // Default to Present if no attendance record
            attendanceMap[item.student._id] = {
              status: 'Present',
              remarks: ''
            };
          }
        });

        setAttendance(attendanceMap);
        setAttendanceMarked(isMarked);
      }
    } catch (error) {
      console.error('Error loading students and attendance:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (studentId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const markAllPresent = () => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = {
        ...attendance[student._id],
        status: 'Present',
        remarks: attendance[student._id]?.remarks || ''
      };
    });
    setAttendance(newAttendance);
    showNotification('All students marked as present');
  };

  const submitAttendance = async () => {
    if (!selectedClass) {
      showNotification('Please select class', 'error');
      return;
    }

    const selectedClassObj = classes.find(c => c._id === selectedClass);

    setLoading(true);
    try {
      const records = students.map(student => ({
        studentId: student._id,
        status: attendance[student._id]?.status || 'Present',
        remarks: attendance[student._id]?.remarks || '',
        leaveType: attendance[student._id]?.status === 'Leave' ? 'Other' : undefined,
        leaveReason: attendance[student._id]?.status === 'Leave' ? attendance[student._id]?.remarks : undefined
      }));

      await axios.post(`${apiUrl}/api/attendance/mark-bulk`, {
        date: selectedDate,
        classId: selectedClass,
        markedBy: null,
        records
      });

      showNotification('Attendance saved successfully!');
      setAttendanceMarked(true);

      // Reload to get the saved attendance with IDs
      loadStudentsAndAttendance();
    } catch (error) {
      console.error(error);
      showNotification('Error saving attendance: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    const selectedClassObj = classes.find(c => c._id === classId);

    setStudents([]);
    setAttendance({});
  };

  const filteredStudents = students.filter(student => {
    const roll = student.rollNumber?.toString().toLowerCase() || '';
    const name = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    return roll.includes(query) || name.includes(query);
  });

  const stats = useMemo(() => {
    const total = students.length;
    const present = Object.values(attendance).filter(a => a.status === 'Present').length;
    const absent = Object.values(attendance).filter(a => a.status === 'Absent').length;
    const leave = Object.values(attendance).filter(a => a.status === 'Leave').length;
    const late = Object.values(attendance).filter(a => a.status === 'Late').length;
    return { total, present, absent, leave, late };
  }, [students, attendance]);

  const selectedClassObj = classes.find(c => c._id === selectedClass);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Mark Attendance
        </h2>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Record daily attendance for students
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827'
              }}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - Grade {cls.grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Search Student
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Roll No. or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={markAllPresent}
            disabled={!selectedClass || students.length === 0}
            style={{
              padding: '10px 20px',
              background: (!selectedClass || students.length === 0) ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (!selectedClass || students.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            Mark All Present
          </button>

          {attendanceMarked && (
            <span style={{
              padding: '10px 16px',
              background: '#dbeafe',
              color: '#1e40af',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              ✓ Attendance already marked for this date
            </span>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
            <span style={{ color: '#6b7280' }}>Total: <span style={{ color: '#111827' }}>{stats.total}</span></span>
            <span style={{ color: '#10b981' }}>Present: {stats.present}</span>
            <span style={{ color: '#ef4444' }}>Absent: {stats.absent}</span>
            <span style={{ color: '#f59e0b' }}>Leave: {stats.leave}</span>
            {stats.late > 0 && <span style={{ color: '#8b5cf6' }}>Late: {stats.late}</span>}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading students...
          </div>
        ) : !selectedClass ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Please select a class to view students
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No students found for the selected class
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Roll No.</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {student.rollNumber}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: '#111827' }}>
                      {student.firstName} {student.lastName}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['Present', 'Absent', 'Leave', 'Late'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateAttendance(student._id, 'status', status)}
                            style={{
                              padding: '6px 16px',
                              border: attendance[student._id]?.status === status ? 'none' : '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              background: attendance[student._id]?.status === status
                                ? status === 'Present' ? '#10b981'
                                  : status === 'Absent' ? '#ef4444'
                                    : status === 'Leave' ? '#f59e0b'
                                      : '#8b5cf6'
                                : 'white',
                              color: attendance[student._id]?.status === status ? 'white' : '#6b7280',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={attendance[student._id]?.remarks || ''}
                        onChange={(e) => updateAttendance(student._id, 'remarks', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={submitAttendance}
          disabled={loading || !selectedClass || students.length === 0}
          style={{
            padding: '14px 32px',
            background: (loading || !selectedClass || students.length === 0) ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: (loading || !selectedClass || students.length === 0) ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}

// Monthly View Component
function MonthlyView({ showNotification }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedClass, setSelectedClass] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [classes, setClasses] = useState([]);

  // Fetch all classes on component mount
  useEffect(() => {
    fetchAllClasses();
  }, []);

  // Load monthly report when filters change
  useEffect(() => {
    if (selectedClass) {
      loadMonthlyReport();
    }
  }, [selectedMonth, selectedYear, selectedClass]);

  const fetchAllClasses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/classes`);
      const classesData = res.data.data || res.data;
      setClasses(classesData);
      
    } catch (error) {
      console.error("Failed to fetch classes", error);
      showNotification('Error loading classes', 'error');
    }
  };

  const loadMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/attendance/monthly-report`, {
        params: {
          month: selectedMonth,
          year: selectedYear,
          classId: selectedClass,
        }
      });

      if (response.data.success) {
        // Transform the data to include student details
        const summaries = response.data.data.summaries.map(summary => ({
          studentId: summary.studentId._id,
          studentName: `${summary.studentId.firstName} ${summary.studentId.lastName}`,
          rollNumber: summary.studentId.rollNumber,
          email: summary.studentId.email,
          totalPresent: summary.totalPresent,
          totalAbsent: summary.totalAbsent,
          totalLeave: summary.totalLeave,
          totalLate: summary.totalLate,
          totalHolidays: summary.totalHolidays,
          workingDays: summary.totalWorkingDays,
          attendancePercentage: summary.attendancePercentage,
          consecutiveAbsences: summary.consecutiveAbsences,
          lastUpdated: summary.lastUpdated
        }));
        
        setMonthlyData(summaries);
      }
    } catch (error) {
      console.error('Error loading monthly report:', error);
      showNotification('Error loading report: ' + (error.response?.data?.message || error.message), 'error');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    const selectedClassObj = classes.find(c => c._id === classId);
  };

  const filteredData = monthlyData.filter(record => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'low') return parseFloat(record.attendancePercentage) < 75;
    if (filterStatus === 'medium') return parseFloat(record.attendancePercentage) >= 75 && parseFloat(record.attendancePercentage) < 90;
    if (filterStatus === 'high') return parseFloat(record.attendancePercentage) >= 90;
    return true;
  });

  const avgAttendance = monthlyData.length > 0
    ? (monthlyData.reduce((sum, r) => sum + parseFloat(r.attendancePercentage), 0) / monthlyData.length).toFixed(2)
    : 0;

  const totalPresent = monthlyData.reduce((sum, r) => sum + r.totalPresent, 0);
  const totalAbsent = monthlyData.reduce((sum, r) => sum + r.totalAbsent, 0);
  const totalLeave = monthlyData.reduce((sum, r) => sum + r.totalLeave, 0);
  const totalLate = monthlyData.reduce((sum, r) => sum + r.totalLate, 0);

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      showNotification('No data to export', 'error');
      return;
    }

    const headers = ['Roll No', 'Student Name', 'Email', 'Working Days', 'Present', 'Absent', 'Leave', 'Late', 'Attendance %', 'Consecutive Absences'];
    const csvData = filteredData.map(record => [
      record.rollNumber,
      record.studentName,
      record.email || 'N/A',
      record.workingDays,
      record.totalPresent,
      record.totalAbsent,
      record.totalLeave,
      record.totalLate,
      record.attendancePercentage + '%',
      record.consecutiveAbsences
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const selectedClassObj = classes.find(c => c._id === selectedClass);
    const fileName = `Attendance_${selectedClassObj?.name || 'Class'}__${getMonthName(selectedMonth)}_${selectedYear}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Report exported successfully!');
  };

  const getDefaultersList = () => {
    return filteredData.filter(record => parseFloat(record.attendancePercentage) < 75);
  };

  const selectedClassObj = classes.find(c => c._id === selectedClass);
  const defaulters = getDefaultersList();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Monthly Attendance Report
        </h2>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          View comprehensive monthly attendance statistics
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827'
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827'
              }}
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827'
              }}
            >
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - Grade {cls.grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Filter by %
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827'
              }}
            >
              <option value="all">All Students</option>
              <option value="high">≥ 90%</option>
              <option value="medium">75% - 89%</option>
              <option value="low">&lt; 75%</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', display: 'block' }}>
                Class Average
              </span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {avgAttendance}%
              </span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', display: 'block' }}>
                Total Students
              </span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                {monthlyData.length}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', display: 'block' }}>
                Total Present
              </span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {totalPresent}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', display: 'block' }}>
                Total Absent
              </span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                {totalAbsent}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', display: 'block' }}>
                Defaulters (&lt;75%)
              </span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {defaulters.length}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={exportToCSV}
              disabled={filteredData.length === 0}
              style={{
                padding: '10px 20px',
                background: filteredData.length === 0 ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} />
              Export to CSV
            </button>
            
            {defaulters.length > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('low');
                  showNotification(`Found ${defaulters.length} student(s) with attendance below 75%`);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View {defaulters.length} Defaulter{defaulters.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Report Table */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            {getMonthName(selectedMonth)} {selectedYear} - {selectedClassObj?.name}
          </h3>
          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Showing {filteredData.length} of {monthlyData.length} students
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading report...
          </div>
        ) : !selectedClass ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Please select a class to view the report
          </div>
        ) : monthlyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No attendance data available for the selected month
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Roll No.</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Working Days</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Present</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Absent</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Leave</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Late</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Consecutive Absences</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record, idx) => {
                  const percentage = parseFloat(record.attendancePercentage);
                  const statusColor = percentage >= 90 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444';
                  const showWarning = record.consecutiveAbsences >= 3;

                  return (
                    <tr key={idx} style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: showWarning ? '#fef2f2' : 'transparent'
                    }}>
                      <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        {record.rollNumber}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: '#111827' }}>
                        {record.studentName}
                        {showWarning && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '12px', 
                            color: '#ef4444', 
                            fontWeight: '600' 
                          }}>
                            ⚠️ Alert
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                        {record.workingDays}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                        {record.totalPresent}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                        {record.totalAbsent}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
                        {record.totalLeave}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>
                        {record.totalLate}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: showWarning ? '#ef4444' : '#6b7280' }}>
                        {record.consecutiveAbsences}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '700',
                          background: `${statusColor}15`,
                          color: statusColor
                        }}>
                          {record.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


function ReportsView({ showNotification }) {
  const [reportType, setReportType] = useState('defaulters');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [threshold, setThreshold] = useState(75);
  const [classes, setClasses] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [classWiseStats, setClassWiseStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trendData, setTrendData] = useState([]);

  // Fetch all classes on component mount
  useEffect(() => {
    fetchAllClasses();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (reportType === 'defaulters') {
      loadDefaulters();
    } else if (reportType === 'classwise') {
      loadClassWiseStats();
    } else if (reportType === 'trends') {
      loadTrendData();
    }
  }, [reportType, selectedClass, selectedSection, selectedMonth, selectedYear, threshold, selectedDate]);

  const fetchAllClasses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/classes`);
      const classesData = res.data.data || res.data;
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to fetch classes", error);
      showNotification('Error loading classes', 'error');
    }
  };

  const loadDefaulters = async () => {
    setLoading(true);
    try {
      const params = {
        threshold,
        month: selectedMonth,
        year: selectedYear
      };

      if (selectedClass !== 'all') {
        params.classId = selectedClass;
      }
      if (selectedSection !== 'all') {
        params.section = selectedSection;
      }

      const response = await axios.get(`${apiUrl}/api/attendance/defaulters`, {
        params
      });

      if (response.data.success) {
        const defaultersData = response.data.data.defaulters.map(item => ({
          studentId: item.studentId?._id,
          rollNumber: item.studentId?.rollNumber,
          name: `${item.studentId?.firstName} ${item.studentId?.lastName}`,
          email: item.studentId?.email,
          phone: item.studentId?.phone,
          guardianPhone: item.studentId?.guardianPhone,
          class: item.classId?.name,
          grade: item.classId?.grade,
          section: item.section,
          percentage: item.attendancePercentage,
          totalAbsent: item.totalAbsent,
          totalPresent: item.totalPresent,
          totalLeave: item.totalLeave,
          totalWorkingDays: item.totalWorkingDays,
          consecutiveAbsences: item.consecutiveAbsences,
          lastUpdated: item.lastUpdated
        }));
        
        setDefaulters(defaultersData);
      }
    } catch (error) {
      console.error('Error loading defaulters:', error);
      showNotification('Error loading defaulters: ' + (error.response?.data?.message || error.message), 'error');
      setDefaulters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClassWiseStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/attendance/class-stats`, {
        params: {
          date: selectedDate
        }
      });

      if (response.data.success) {
        const statsData = response.data.data.stats;
        
        // Filter by selected class if not 'all'
        const filteredStats = selectedClass === 'all' 
          ? statsData 
          : statsData.filter(stat => stat.classId === selectedClass);

        setClassWiseStats(filteredStats);
      }
    } catch (error) {
      console.error('Error loading class-wise stats:', error);
      showNotification('Error loading statistics: ' + (error.response?.data?.message || error.message), 'error');
      setClassWiseStats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async () => {
    setLoading(true);
    try {
      // Get data for the last 6 months
      const monthsData = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = targetDate.getMonth() + 1;
        const year = targetDate.getFullYear();

        try {
          const params = {
            month,
            year
          };

          if (selectedClass !== 'all') {
            params.classId = selectedClass;
          }
          if (selectedSection !== 'all') {
            params.section = selectedSection;
          }

          const response = await axios.get(`${apiUrl}/api/attendance/monthly-report`, {
            params
          });

          if (response.data.success && response.data.data.summaries.length > 0) {
            const summaries = response.data.data.summaries;
            const avgAttendance = summaries.reduce((sum, s) => sum + s.attendancePercentage, 0) / summaries.length;
            const totalPresent = summaries.reduce((sum, s) => sum + s.totalPresent, 0);
            const totalAbsent = summaries.reduce((sum, s) => sum + s.totalAbsent, 0);
            const totalStudents = summaries.length;

            monthsData.push({
              month: getMonthName(month),
              year,
              avgAttendance: avgAttendance.toFixed(2),
              totalPresent,
              totalAbsent,
              totalStudents
            });
          }
        } catch (err) {
          // Skip months with no data
          console.log(`No data for ${month}/${year}`);
        }
      }

      setTrendData(monthsData);
    } catch (error) {
      console.error('Error loading trend data:', error);
      showNotification('Error loading trends', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    if (classId === 'all') {
      setSelectedSection('all');
    } else {
      const selectedClassObj = classes.find(c => c._id === classId);
      if (selectedClassObj && selectedClassObj.sections && selectedClassObj.sections.length > 0) {
        setSelectedSection(selectedClassObj.sections[0]);
      } else {
        setSelectedSection('all');
      }
    }
  };

  const exportDefaultersToCSV = () => {
    if (defaulters.length === 0) {
      showNotification('No defaulters to export', 'error');
      return;
    }

    const headers = ['Roll No', 'Name', 'Class', 'Section', 'Email', 'Phone', 'Guardian Phone', 'Attendance %', 'Total Present', 'Total Absent', 'Total Leave', 'Working Days', 'Consecutive Absences'];
    const csvData = defaulters.map(student => [
      student.rollNumber,
      student.name,
      student.class,
      student.section,
      student.email || 'N/A',
      student.phone || 'N/A',
      student.guardianPhone || 'N/A',
      student.percentage + '%',
      student.totalPresent,
      student.totalAbsent,
      student.totalLeave,
      student.totalWorkingDays,
      student.consecutiveAbsences
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `Defaulters_Below_${threshold}%_${getMonthName(selectedMonth)}_${selectedYear}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Defaulters list exported successfully!');
  };

  const exportClassStatsToCSV = () => {
    if (classWiseStats.length === 0) {
      showNotification('No statistics to export', 'error');
      return;
    }

    const headers = ['Class', 'Section', 'Total Students', 'Present', 'Absent', 'Leave', 'Unmarked', 'Attendance %'];
    const csvData = classWiseStats.map(stat => [
      stat.className,
      stat.section,
      stat.totalStudents,
      stat.present,
      stat.absent,
      stat.leave,
      stat.unmarked,
      stat.attendancePercentage + '%'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `ClassWise_Stats_${selectedDate}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Statistics exported successfully!');
  };

  const selectedClassObj = classes.find(c => c._id === selectedClass);
  const availableSections = selectedClass === 'all' ? [] : (selectedClassObj?.sections || []);

  // Calculate overall stats for defaulters
  const totalDefaulters = defaulters.length;
  const avgDefaulterAttendance = defaulters.length > 0
    ? (defaulters.reduce((sum, d) => sum + d.percentage, 0) / defaulters.length).toFixed(2)
    : 0;
  const criticalDefaulters = defaulters.filter(d => d.percentage < 50).length;
  const withConsecutiveAbsences = defaulters.filter(d => d.consecutiveAbsences >= 3).length;

  // Calculate overall stats for class-wise
  const totalClassesStats = classWiseStats.length;
  const overallAvgAttendance = classWiseStats.length > 0
    ? (classWiseStats.reduce((sum, c) => sum + parseFloat(c.attendancePercentage), 0) / classWiseStats.length).toFixed(2)
    : 0;
  const totalPresentToday = classWiseStats.reduce((sum, c) => sum + c.present, 0);
  const totalAbsentToday = classWiseStats.reduce((sum, c) => sum + c.absent, 0);
  const totalStudentsOverall = classWiseStats.reduce((sum, c) => sum + c.totalStudents, 0);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Attendance Reports & Analytics
        </h2>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Comprehensive attendance insights and defaulter tracking
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'defaulters', label: 'Defaulter List', icon: AlertCircle },
            { id: 'classwise', label: 'Class-wise Summary', icon: Users },
            { id: 'trends', label: 'Trends & Insights', icon: TrendingUp }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              style={{
                padding: '10px 24px',
                border: reportType === type.id ? 'none' : '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: reportType === type.id ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                color: reportType === type.id ? 'white' : '#6b7280',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>

        {/* DEFAULTERS VIEW */}
        {reportType === 'defaulters' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Threshold Percentage
                </label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  min="0"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{getMonthName(month)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Class Filter
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name} - Grade {cls.grade}</option>
                  ))}
                </select>
              </div>
              {selectedClass !== 'all' && availableSections.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Section Filter
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  >
                    <option value="all">All Sections</option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Total Defaulters</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{totalDefaulters}</div>
              </div>
              <div style={{ background: '#fff7ed', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#9a3412', fontWeight: '600', marginBottom: '4px' }}>Avg Attendance</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{avgDefaulterAttendance}%</div>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Critical (&lt;50%)</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>{criticalDefaulters}</div>
              </div>
              <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>Consecutive Absent (≥3)</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#d97706' }}>{withConsecutiveAbsences}</div>
              </div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={20} color="#ef4444" />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                    {totalDefaulters} student(s) below {threshold}% attendance threshold in {getMonthName(selectedMonth)} {selectedYear}
                  </span>
                </div>
                <button
                  onClick={exportDefaultersToCSV}
                  disabled={defaulters.length === 0}
                  style={{
                    padding: '8px 16px',
                    background: defaulters.length === 0 ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: defaulters.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  Export List
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading defaulters...
              </div>
            ) : defaulters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                  Excellent! No Defaulters Found
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  All students are meeting the {threshold}% attendance threshold
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Roll No.</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Student Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Class</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Attendance %</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>P/A/L</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Consecutive Abs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaulters.map((student, idx) => {
                      const isCritical = student.percentage < 50;
                      const hasConsecutiveAbsences = student.consecutiveAbsences >= 3;

                      return (
                        <tr key={idx} style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: isCritical ? '#fef2f2' : hasConsecutiveAbsences ? '#fffbeb' : 'transparent'
                        }}>
                          <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                            {student.rollNumber}
                          </td>
                          <td style={{ padding: '16px 12px', fontSize: '14px', color: '#111827' }}>
                            {student.name}
                            {isCritical && (
                              <span style={{ 
                                marginLeft: '8px', 
                                padding: '2px 8px',
                                fontSize: '11px', 
                                color: '#dc2626',
                                background: '#fee2e2',
                                borderRadius: '4px',
                                fontWeight: '600' 
                              }}>
                                CRITICAL
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px 12px', fontSize: '14px', color: '#6b7280' }}>
                            {student.class} - {student.section}
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                              {student.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                                  <Mail size={12} />
                                  <span>{student.email}</span>
                                </div>
                              )}
                              {student.guardianPhone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                                  <Phone size={12} />
                                  <span>{student.guardianPhone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: '700',
                              background: isCritical ? '#fee2e2' : '#fef2f2',
                              color: isCritical ? '#dc2626' : '#ef4444'
                            }}>
                              {student.percentage}%
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>{student.totalPresent}</span>
                            {' / '}
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>{student.totalAbsent}</span>
                            {' / '}
                            <span style={{ color: '#f59e0b', fontWeight: '600' }}>{student.totalLeave}</span>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: hasConsecutiveAbsences ? '#ef4444' : '#6b7280' }}>
                            {student.consecutiveAbsences}
                            {hasConsecutiveAbsences && ' ⚠️'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CLASS-WISE VIEW */}
        {reportType === 'classwise' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Class Filter
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name} - Grade {cls.grade}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Overall Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>Total Classes</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{totalClassesStats}</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Avg Attendance</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{overallAvgAttendance}%</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Present Today</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{totalPresentToday}</div>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Absent Today</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{totalAbsentToday}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={exportClassStatsToCSV}
                disabled={classWiseStats.length === 0}
                style={{
                  padding: '8px 16px',
                  background: classWiseStats.length === 0 ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: classWiseStats.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} />
                Export Stats
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading statistics...
              </div>
            ) : classWiseStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No statistics available for the selected date
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {classWiseStats.map((cls, idx) => {
                  const percentage = parseFloat(cls.attendancePercentage);
                  const statusColor = percentage >= 90 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444';

                  return (
                    <div key={idx} style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                        {cls.className} - Section {cls.section}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Total Students</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{cls.totalStudents}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Attendance %</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: statusColor }}>{cls.attendancePercentage}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Present</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{cls.present}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Absent</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{cls.absent}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Leave</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{cls.leave}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Unmarked</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af' }}>{cls.unmarked}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div style={{ marginTop: '16px', background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${cls.attendancePercentage}%`, 
                          background: statusColor, 
                          height: '100%',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TRENDS VIEW */}
        {reportType === 'trends' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Class Filter
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827'
                  }}
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name} - Grade {cls.grade}</option>
                  ))}
                </select>
              </div>
              {selectedClass !== 'all' && availableSections.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Section Filter
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  >
                    <option value="all">All Sections</option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading trends data...</div>
              </div>
            ) : trendData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Calendar size={64} color="#cbd5e1" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  No Trend Data Available
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Attendance data for the last 6 months is not available for the selected filters
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                  Last 6 Months Attendance Trends
                </h3>
                
                {/* Trend Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {trendData.map((data, idx) => {
                    const percentage = parseFloat(data.avgAttendance);
                    const statusColor = percentage >= 90 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444';
                    const prevData = trendData[idx - 1];
                    const trend = prevData ? (percentage - parseFloat(prevData.avgAttendance)).toFixed(2) : null;
                    const trendUp = trend > 0;

                    return (
                      <div key={idx} style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{data.month}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{data.year}</div>
                          </div>
                          {trend !== null && (
                            <div style={{ 
                              fontSize: '12px', 
                              fontWeight: '600',
                              color: trendUp ? '#10b981' : '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
                            </div>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '32px', fontWeight: '700', color: statusColor, marginBottom: '12px' }}>
                          {data.avgAttendance}%
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Students: {data.totalStudents}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Present: <span style={{ color: '#10b981', fontWeight: '600' }}>{data.totalPresent}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Absent: <span style={{ color: '#ef4444', fontWeight: '600' }}>{data.totalAbsent}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simple trend visualization */}
                <div style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  padding: '24px',
                  marginTop: '24px'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                    Attendance Percentage Trend
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    gap: '12px',
                    height: '200px',
                    paddingTop: '20px'
                  }}>
                    {trendData.map((data, idx) => {
                      const percentage = parseFloat(data.avgAttendance);
                      const height = (percentage / 100) * 180;
                      const statusColor = percentage >= 90 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444';

                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ 
                            width: '100%',
                            height: `${height}px`,
                            background: `linear-gradient(to top, ${statusColor}, ${statusColor}99)`,
                            borderRadius: '8px 8px 0 0',
                            transition: 'height 0.3s ease',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            padding: '8px'
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>
                              {data.avgAttendance}%
                            </span>
                          </div>
                          <div style={{ 
                            marginTop: '8px',
                            fontSize: '11px',
                            color: '#6b7280',
                            textAlign: 'center',
                            fontWeight: '600'
                          }}>
                            {data.month.substring(0, 3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Insights */}
                <div style={{ 
                  marginTop: '24px',
                  padding: '20px',
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>
                    📊 Key Insights
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '14px', lineHeight: '1.8' }}>
                    <li>
                      <strong>Highest Attendance:</strong> {trendData.reduce((max, d) => parseFloat(d.avgAttendance) > parseFloat(max.avgAttendance) ? d : max).month} {trendData.reduce((max, d) => parseFloat(d.avgAttendance) > parseFloat(max.avgAttendance) ? d : max).year} ({trendData.reduce((max, d) => parseFloat(d.avgAttendance) > parseFloat(max.avgAttendance) ? d : max).avgAttendance}%)
                    </li>
                    <li>
                      <strong>Lowest Attendance:</strong> {trendData.reduce((min, d) => parseFloat(d.avgAttendance) < parseFloat(min.avgAttendance) ? d : min).month} {trendData.reduce((min, d) => parseFloat(d.avgAttendance) < parseFloat(min.avgAttendance) ? d : min).year} ({trendData.reduce((min, d) => parseFloat(d.avgAttendance) < parseFloat(min.avgAttendance) ? d : min).avgAttendance}%)
                    </li>
                    <li>
                      <strong>Overall Average:</strong> {(trendData.reduce((sum, d) => sum + parseFloat(d.avgAttendance), 0) / trendData.length).toFixed(2)}%
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

