import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiSave, FiX } from 'react-icons/fi';
import {
  getAllTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  bulkCreateTimeSlots
} from '../../services/timetableService';

const TimeSlotManager = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    order: '',
    label: '',
    isBreak: false
  });

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await getAllTimeSlots();
      setTimeSlots(response.data || []);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      alert('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSlot) {
        await updateTimeSlot(editingSlot._id, formData);
        alert('Time slot updated successfully');
      } else {
        await createTimeSlot(formData);
        alert('Time slot created successfully');
      }

      fetchTimeSlots();
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Failed to save time slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      order: slot.order,
      label: slot.label || '',
      isBreak: slot.isBreak
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await deleteTimeSlot(id);
      alert('Time slot deleted successfully');
      fetchTimeSlots();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete time slot');
    }
  };

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      order: '',
      label: '',
      isBreak: false
    });
    setEditingSlot(null);
    setShowForm(false);
  };

  const createDefaultSlots = async () => {
    if (!window.confirm('This will create 8 default time slots (45 min each). Continue?')) return;

    const defaultSlots = [
      { startTime: '08:00', endTime: '08:45', order: 1, label: 'Period 1' },
      { startTime: '08:45', endTime: '09:30', order: 2, label: 'Period 2' },
      { startTime: '09:30', endTime: '09:45', order: 3, label: 'Short Break', isBreak: true },
      { startTime: '09:45', endTime: '10:30', order: 4, label: 'Period 3' },
      { startTime: '10:30', endTime: '11:15', order: 5, label: 'Period 4' },
      { startTime: '11:15', endTime: '12:00', order: 6, label: 'Lunch Break', isBreak: true },
      { startTime: '12:00', endTime: '12:45', order: 7, label: 'Period 5' },
      { startTime: '12:45', endTime: '13:30', order: 8, label: 'Period 6' }
    ];

    try {
      const response = await bulkCreateTimeSlots(defaultSlots);
      alert(`Created ${response.data.created.length} time slots`);
      fetchTimeSlots();
    } catch (error) {
      console.error('Bulk create error:', error);
      alert('Failed to create default time slots');
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <FiClock className="text-primary" />
          Time Slot Management
        </h2>
        <div className="flex gap-2">
          {timeSlots.length === 0 && (
            <button
              onClick={createDefaultSlots}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 flex items-center gap-2"
            >
              Create Default Slots
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 flex items-center gap-2"
          >
            <FiPlus /> Add Time Slot
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-6">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">
            {editingSlot ? 'Edit Time Slot' : 'Create New Time Slot'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full rounded border border-stroke bg-white px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full rounded border border-stroke bg-white px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Order *
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  required
                  min="1"
                  className="w-full rounded border border-stroke bg-white px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Period 1"
                  className="w-full rounded border border-stroke bg-white px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBreak}
                  onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-black dark:text-white">
                  This is a break period
                </span>
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="rounded bg-primary px-6 py-2 text-white hover:bg-opacity-90 flex items-center gap-2"
              >
                <FiSave /> {editingSlot ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-opacity-90 flex items-center gap-2"
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Time Slots List */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {timeSlots.map((slot) => (
              <div
                key={slot._id}
                className={`rounded-lg border p-4 ${
                  slot.isBreak
                    ? 'bg-orange-50 border-orange-300 dark:bg-orange-900 dark:bg-opacity-20 dark:border-orange-600'
                    : 'bg-white border-stroke dark:bg-meta-4 dark:border-strokedark'
                } hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-black dark:text-white">
                      {slot.label || `Slot ${slot.order}`}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order: {slot.order}
                    </p>
                  </div>
                  {slot.isBreak && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
                      Break
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <FiClock size={16} />
                    <span className="font-semibold">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Duration: {slot.duration} minutes
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(slot)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {timeSlots.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <FiClock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No time slots created yet</p>
              <p className="text-sm mt-2">Click "Add Time Slot" or "Create Default Slots" to get started</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimeSlotManager;