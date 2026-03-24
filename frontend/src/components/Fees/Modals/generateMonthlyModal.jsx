import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { generateMonthlyInvoices } from '../../../services/feeService';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const GenerateMonthlyModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showCustomize, setShowCustomize] = useState(false);
  const [formData, setFormData] = useState({
    classId: 'all',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: '',
    feeItems: [{ title: 'Tuition Fee', amount: '', description: '' }]
  });

  const fetchStudents = async (classId) => {
    try {
      const res = await axios.get(`${apiUrl}/api/students/getStudentByClass/${classId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log(res);
      setStudents(res.data.data || []);
      setSelectedStudents(res.data.data.map((s) => s._id)); // all checked by default
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const toggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/classes`);
      const data = await response.json();
      console.log(response, data);
      setClasses(data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
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

    // Validation
    if (!formData.dueDate) {
      alert('Please select a due date');
      return;
    }

    if (formData.feeItems.some(item => !item.title || !item.amount)) {
      alert('Please fill in all fee item details');
      return;
    }

    try {
      setLoading(true);
      const response = await generateMonthlyInvoices({
        ...formData,
        students: selectedStudents
      });
      alert(
        `Invoice generation completed\n\n` +
        `Created: ${response.invoicesCreated}\n` +
        `Skipped (already existed): ${response.invoicesSkipped}`
      ); onClose();
    } catch (error) {
      console.error('Failed to generate invoices:', error);
      alert(error.response?.data?.message || 'Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl" style={{ maxWidth: "95%", margin: "0 auto", padding: "30px 10px" }}>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
        Generate Monthly Fee Invoices
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Class Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Select Class
          </label>
          <select
            value={formData.classId}
            onChange={(e) => {
              const classId = e.target.value;

              setFormData({ ...formData, classId });

              if (classId !== "all") {
                fetchStudents(classId);
              }
            }}
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            required
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - Section {cls.section}
              </option>
            ))}
          </select>
        </div>
        {formData.classId !== "all" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowCustomize(!showCustomize)}
              className="text-primary font-medium"
            >
              Customize Invoice
            </button>

            {showCustomize && (
              <div className="mt-3 max-h-60 overflow-y-auto rounded border p-3 dark:border-strokedark">
                {students.map((student) => (
                  <label
                    key={student._id}
                    className="flex items-center gap-2 mb-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => toggleStudent(student._id)}
                    />
                    {student.firstName} {student.lastName}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Month and Year */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Month
            </label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Year
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-4">
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

        {/* Fee Items */}
        <div className="mb-6">
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
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-black dark:text-white">Total Amount:</span>
              <span className="text-xl font-bold text-primary">
                PKR {getTotalAmount().toLocaleString()}
              </span>
            </div>
          </div>
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
            {loading ? 'Generating...' : 'Generate Invoices'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateMonthlyModal;