import { useState, useEffect } from 'react';
import { generateEventInvoices } from '../../../services/feeService';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const CreateEventInvoiceModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectionType, setSelectionType] = useState('classes'); // 'classes' or 'students'
  const [formData, setFormData] = useState({
    eventName: '',
    amount: '',
    description: '',
    dueDate: '',
    classIds: [],
    studentIds: []
  });

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/classes`);
      console.log(response.data);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/students`);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleClassSelection = (classId) => {
    const newClassIds = formData.classIds.includes(classId)
      ? formData.classIds.filter(id => id !== classId)
      : [...formData.classIds, classId];

    setFormData({ ...formData, classIds: newClassIds });
  };

  const handleStudentSelection = (studentId) => {
    const newStudentIds = formData.studentIds.includes(studentId)
      ? formData.studentIds.filter(id => id !== studentId)
      : [...formData.studentIds, studentId];

    setFormData({ ...formData, studentIds: newStudentIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectionType === 'classes' && formData.classIds.length === 0) {
      alert('Please select at least one class');
      return;
    }

    if (selectionType === 'students' && formData.studentIds.length === 0) {
      alert('Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        classIds: selectionType === 'classes' ? formData.classIds : [],
        studentIds: selectionType === 'students' ? formData.studentIds : []
      };

      const response = await generateEventInvoices(submitData);
      alert(`Successfully generated ${response.count} event invoices`);
      onClose();
    } catch (error) {
      console.error('Failed to generate event invoices:', error);
      alert(error.response?.data?.message || 'Failed to generate event invoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto" style={{ maxWidth: "100%", margin: "0 auto", padding: "30px 30px" }}>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
        Create Event Invoice
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Event Details */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Event Name
          </label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            placeholder="e.g., Annual Sports Day, Field Trip"
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Amount (PKR)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            placeholder="Brief description of the event..."
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />
        </div>

        {/* Selection Type Toggle */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Select Recipients
          </label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setSelectionType('classes')}
              className={`flex-1 rounded px-4 py-2 font-medium transition-colors ${selectionType === 'classes'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-black dark:bg-meta-4 dark:text-white'
                }`}
            >
              By Classes
            </button>
            <button
              type="button"
              onClick={() => setSelectionType('students')}
              className={`flex-1 rounded px-4 py-2 font-medium transition-colors ${selectionType === 'students'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-black dark:bg-meta-4 dark:text-white'
                }`}
            >
              By Students
            </button>
          </div>
        </div>

        {/* Class Selection */}
        {selectionType === 'classes' && (
          <div className="mb-6 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
            <p className="text-sm font-medium text-black dark:text-white mb-3">
              Select Classes ({formData.classIds.length} selected)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {classes.map((cls) => (
                <label
                  key={cls._id}
                  className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${formData.classIds.includes(cls._id)
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-boxdark'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.classIds.includes(cls._id)}
                    onChange={() => handleClassSelection(cls._id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-black dark:text-white">
                    {cls.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Student Selection */}
        {selectionType === 'students' && (
          <div className="mb-6 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
            <p className="text-sm font-medium text-black dark:text-white mb-3">
              Select Students ({formData.studentIds.length} selected)
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {students.map((student) => (
                <label
                  key={student._id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${formData.studentIds.includes(student._id)
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-boxdark'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.studentIds.includes(student._id)}
                    onChange={() => handleStudentSelection(student._id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <img
                    src={student.profilePic ? `${apiUrl}0/${student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                    alt={student.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black dark:text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Roll #: {student.rollNumber} | Class: {student.class?.name}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Total Preview */}
        {formData.amount && (
          <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-black dark:text-white">Amount per student:</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                PKR {parseFloat(formData.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-black dark:text-white">
                Total invoices to generate:
              </span>
              <span className="text-lg font-semibold text-black dark:text-white">
                {selectionType === 'classes' ? formData.classIds.length + ' classes' : formData.studentIds.length + ' students'}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-stroke px-6 py-2 font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Event Invoices'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventInvoiceModal;