import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiCopy,
  FiCalendar,
  FiClock,
  FiUser,
  FiBook
} from 'react-icons/fi';
import {
  getWeeklyTimetableByClass,
  getActiveTimeSlots,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  daysOfWeek,
  getCurrentAcademicYear,
  formatTimeSlot
} from '../../services/timetableService';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;


const TimetableBuilder = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [editingCell, setEditingCell] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    teacherId: '',
    room: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchClasses();
    fetchTimeSlots();
    fetchSubjects();
    fetchTeachers();
  }, []);

  // Fetch timetable when class/section changes
  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass, academicYear]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/classes`);
      setClasses(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };


  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/courses`);
      setSubjects(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/teachers`);
      setTeachers(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await getActiveTimeSlots();
      setTimeSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      alert('Failed to load time slots');
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await getWeeklyTimetableByClass(
        selectedClass,
        academicYear
      );
      
      // Convert array to grid structure
      const grid = {};
      daysOfWeek.forEach(day => {
        grid[day] = {};
      });
      
      if (response.data && response.data.raw) {
        response.data.raw.forEach(entry => {
          if (!grid[entry.day]) grid[entry.day] = {};
          grid[entry.day][entry.timeSlotId._id] = entry;
        });
      }
      
      setTimetable(grid);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setTimetable({});
  };

  const handleCellClick = (day, timeSlotId, existingEntry = null) => {
    setEditingCell({ day, timeSlotId });
    if (existingEntry) {
      setFormData({
        courseId: existingEntry.courseId._id,
        teacherId: existingEntry.teacherId._id,
        room: existingEntry.room || ''
      });
    } else {
      setFormData({
        courseId: '',
        teacherId: '',
        room: ''
      });
    }
  };

  const handleSave = async () => {
    if (!formData.courseId || !formData.teacherId) {
      alert('Please select subject and teacher');
      return;
    }

    try {
      const entry = timetable[editingCell.day]?.[editingCell.timeSlotId];
      
      const data = {
        classId: selectedClass,
        day: editingCell.day,
        timeSlotId: editingCell.timeSlotId,
        courseId: formData.courseId,
        teacherId: formData.teacherId,
        room: formData.room,
        academicYear
      };

      if (entry) {
        // Update existing
        await updateTimetableEntry(entry._id, data);
        alert('Timetable updated successfully');
      } else {
        // Create new
        await createTimetableEntry(data);
        alert('Timetable entry created successfully');
      }

      fetchTimetable();
      handleCancel();
    } catch (error) {
      console.error('Save error:', error);
      if (error.response?.status === 409) {
        alert(error.response.data.message || 'Conflict detected');
      } else {
        alert('Failed to save entry');
      }
    }
  };

  const handleDelete = async (day, timeSlotId) => {
    const entry = timetable[day]?.[timeSlotId];
    if (!entry) return;

    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteTimetableEntry(entry._id);
      alert('Entry deleted successfully');
      fetchTimetable();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete entry');
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setFormData({ courseId: '', teacherId: '', room: '' });
  };

  const renderCell = (day, timeSlot) => {
    const entry = timetable[day]?.[timeSlot._id];
    const isEditing = editingCell?.day === day && editingCell?.timeSlotId === timeSlot._id;

    if (isEditing) {
      return (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg border-2 border-blue-500">
          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            className="w-full mb-2 px-2 py-1 text-sm border rounded dark:bg-boxdark dark:border-strokedark dark:text-white"
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>

          <select
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            className="w-full mb-2 px-2 py-1 text-sm border rounded dark:bg-boxdark dark:border-strokedark dark:text-white"
          >
            <option value="">Select Teacher</option>
            {teachers.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Room (optional)"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            className="w-full mb-2 px-2 py-1 text-sm border rounded dark:bg-boxdark dark:border-strokedark dark:text-white"
          />

          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center justify-center gap-1"
            >
              <FiSave size={12} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 flex items-center justify-center gap-1"
            >
              <FiX size={12} /> Cancel
            </button>
          </div>
        </div>
      );
    }

    if (entry) {
      return (
        <div className="p-3 bg-white dark:bg-meta-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-stroke dark:border-strokedark">
          <div className="mb-2">
            <div className="font-semibold text-sm text-black dark:text-white flex items-center gap-1">
              <FiBook size={12} className="text-primary" />
              {entry.courseId?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              <FiUser size={10} />
              {entry.teacherId?.firstName} {entry.teacherId?.lastName}
            </div>
            {entry.room && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Room: {entry.room}
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleCellClick(day, timeSlot._id, entry)}
              className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 flex items-center justify-center gap-1"
            >
              <FiEdit2 size={10} /> Edit
            </button>
            <button
              onClick={() => handleDelete(day, timeSlot._id)}
              className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex items-center justify-center gap-1"
            >
              <FiTrash2 size={10} /> Del
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => handleCellClick(day, timeSlot._id)}
        className="p-3 min-h-[100px] bg-gray-50 dark:bg-boxdark-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-strokedark hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-10 cursor-pointer transition-all flex items-center justify-center"
      >
        <FiPlus className="text-gray-400 dark:text-gray-600" size={24} />
      </div>
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-primary" />
          Timetable Builder
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name} - Section {cls.section}</option>
            ))}
          </select>

          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Academic Year (e.g., 2024-2025)"
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />
        </div>
      </div>

      {/* Timetable Grid */}
      {!selectedClass ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <FiCalendar size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Please select a class and section to view/edit timetable</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-2 dark:bg-meta-4">
                <th className="p-3 text-left font-semibold text-black dark:text-white border border-stroke dark:border-strokedark">
                  <div className="flex items-center gap-2">
                    <FiClock size={16} />
                    Time
                  </div>
                </th>
                {daysOfWeek.map(day => (
                  <th key={day} className="p-3 text-center font-semibold text-black dark:text-white border border-stroke dark:border-strokedark min-w-[180px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot._id} className="hover:bg-gray-50 dark:hover:bg-meta-4">
                  <td className="p-3 border border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                    <div className="font-medium text-sm text-black dark:text-white">
                      {slot.label || `Period ${slot.order}`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTimeSlot(slot)}
                    </div>
                    {slot.isBreak && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs rounded">
                        Break
                      </span>
                    )}
                  </td>
                  {daysOfWeek.map(day => (
                    <td key={`${day}-${slot._id}`} className="p-2 border border-stroke dark:border-strokedark">
                      {renderCell(day, slot)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {timeSlots.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No time slots configured. Please create time slots first.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimetableBuilder;