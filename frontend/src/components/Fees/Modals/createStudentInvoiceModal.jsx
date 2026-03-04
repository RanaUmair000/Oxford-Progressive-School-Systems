import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { createStudentInvoice } from '../../../services/feeService';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const CreateStudentInvoiceModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    invoiceType: 'manual',
    dueDate: '',
    notes: '',
    feeItems: [{ title: '', amount: '', description: '' }]
  });

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStudents();
    }
  }, [searchQuery]);

  const searchStudents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/students?search=${searchQuery}`);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to search students:', error);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setFormData({ ...formData, studentId: student._id });
    setStudents([]);
    setSearchQuery('');
  };

  const addFeeItem = () => {
    setFormData({
      ...formData,
      feeItems: [...formData.feeItems, { title: '', amount: '', description: '' }]
    });
  };

  const removeFeeItem = (index) => {
    const newItems = formData.feeItems.filter((_, i) => i !== index);
    setFormData({ ...formData, feeItems: newItems });
  };

  const updateFeeItem = (index, field, value) => {
    const newItems = [...formData.feeItems];
    newItems[index][field] = value;
    setFormData({ ...formData, feeItems: newItems });
  };

  const getTotalAmount = () => {
    return formData.feeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    if (formData.feeItems.some(item => !item.title || !item.amount)) {
      alert('Please fill in all fee item details');
      return;
    }

    try {
      setLoading(true);
      await createStudentInvoice(formData);
      alert('Invoice created successfully');
      onClose();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl" style={{maxWidth: "95%", margin: "0 auto", padding: "30px 10px"}}>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
        Create Student Invoice
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Student Search */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Search Student
          </label>
          
          {!selectedStudent ? (
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter roll number or name..."
                  className="w-full rounded border border-stroke bg-gray px-4 py-3 pl-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              </div>

              {/* Search Results */}
              {students.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => selectStudent(student)}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4"
                    >
                      <img
                        src={student.profilePic ? `${apiUrl}/${student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                        alt={student.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Roll #: {student.rollNumber} | Class: {student.class?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.profilePic ? `${apiUrl}/${selectedStudent.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                  alt={selectedStudent.firstName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Roll #: {selectedStudent.rollNumber} | Class: {selectedStudent.class?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-red-500 hover:text-red-600"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Invoice Title */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Invoice Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Annual Sports Fee"
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            required
          />
        </div>

        {/* Invoice Type and Due Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Invoice Type
            </label>
            <select
              value={formData.invoiceType}
              onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="manual">Manual</option>
              <option value="event">Event</option>
            </select>
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

        {/* Fee Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-black dark:text-white">
              Fee Items
            </label>
            <button
              type="button"
              onClick={addFeeItem}
              className="flex items-center gap-2 rounded bg-primary px-3 py-1 text-sm text-white hover:bg-opacity-90"
            >
              <FiPlus size={16} />
              Add Item
            </button>
          </div>

          {formData.feeItems.map((item, index) => (
            <div key={index} className="mb-3 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    placeholder="Fee Title"
                    value={item.title}
                    onChange={(e) => updateFeeItem(index, 'title', e.target.value)}
                    className="w-full rounded border border-stroke bg-white px-3 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => updateFeeItem(index, 'amount', e.target.value)}
                    className="w-full rounded border border-stroke bg-white px-3 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                    required
                  />
                  {formData.feeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeeItem(index)}
                      className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={item.description}
                  onChange={(e) => updateFeeItem(index, 'description', e.target.value)}
                  className="w-full rounded border border-stroke bg-white px-3 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="rounded-lg bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-black dark:text-white">Total Amount:</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                PKR {getTotalAmount().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Add any additional notes..."
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />
        </div>

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
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudentInvoiceModal;