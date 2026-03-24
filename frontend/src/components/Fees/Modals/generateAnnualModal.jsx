import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiUser } from 'react-icons/fi';
import { generateAnnualInvoices } from '../../../services/feeService';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

const GenerateAnnualModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const searchRef = useRef(null);
  const [autoAnnualStudents, setAutoAnnualStudents] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    dueDate: '',
    invoiceType: 'annual',
    description: '',
    discount: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
  });

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        searchRef.current  && !searchRef.current.contains(e.target)
      ) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => doSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const doSearch = async (query) => {
    try {
      setSearching(true);
      const res = await axios.get(`${apiUrl}/api/students/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query },
      });
      const results = res.data.data || [];
      setSearchResults(
        results.filter((s) => !selectedStudents.find((sel) => sel._id === s._id))
      );
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const addStudent = (student) => {
    setSelectedStudents((prev) => [...prev, student]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeStudent = (id) =>
    setSelectedStudents((prev) => prev.filter((s) => s._id !== id));

  // ── Fee calculations ──────────────────────────────────────────────────────
  // Annual fee = monthly class fee × 12
  const getAnnualFee    = (s) => (parseFloat(s?.class?.fee) || 0) * 12;

  const getDiscountAmt  = (base) => {
    const d = parseFloat(formData.discount) || 0;
    if (formData.discountType === 'percentage')
      return (base * Math.min(d, 100)) / 100;
    return Math.min(d, base);
  };

  const getStudentTotal = (s) => Math.max(getAnnualFee(s) - getDiscountAmt(getAnnualFee(s)), 0);
  const grandSubtotal   = () => selectedStudents.reduce((sum, s) => sum + getAnnualFee(s), 0);
  const grandDiscount   = () => selectedStudents.reduce((sum, s) => sum + getDiscountAmt(getAnnualFee(s)), 0);
  const grandTotal      = () => selectedStudents.reduce((sum, s) => sum + getStudentTotal(s), 0);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) { alert('Please add at least one student'); return; }
    if (!formData.dueDate)             { alert('Please select a due date'); return; }

    const noFee = selectedStudents.filter((s) => !parseFloat(s?.class?.fee));
    if (noFee.length > 0) {
      const names = noFee.map((s) => `${s.firstName} ${s.lastName}`).join(', ');
      const ok = window.confirm(
        `These students have no class fee set:\n${names}\n\nThey will be skipped. Continue?`
      );
      if (!ok) return;
    }

    try {
      setLoading(true);
      const response = await generateAnnualInvoices({
        ...formData,
        discount:     parseFloat(formData.discount) || 0,
        students: selectedStudents.map((s) => ({
          studentId:      s._id,
          annualFee:      getAnnualFee(s),
          discountAmount: getDiscountAmt(getAnnualFee(s)),
          totalAmount:    getStudentTotal(s),
        })),
      });
      alert(
        `Annual Invoice Generation Completed\n\n` +
        `Created: ${response.invoicesCreated}\n` +
        `Skipped (already existed): ${response.invoicesSkipped}`
      );
      onClose();
    } catch (error) {
      console.error('Failed to generate invoices:', error);
      alert(error.response?.data?.message || 'Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnualStudents = async () => {
  try {
    const res = await axios.get(`${apiUrl}/api/students/annual`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const students = res.data.data || [];

    setSelectedStudents((prev) => {
      const existingIds = prev.map((s) => s._id);

      const newStudents = students.filter(
        (s) => !existingIds.includes(s._id)
      );

      return [...prev, ...newStudents];
    });

  } catch (err) {
    console.error("Failed to load annual students", err);
  }
};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full" style={{ maxWidth: '95%', margin: '0 auto', padding: '30px 10px' }}>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
        Generate Annual Fee Invoices
      </h3>

      <form onSubmit={handleSubmit}>

        {/* ── Student Search ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Search &amp; Add Students
          </label>

          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-2 rounded border border-stroke bg-gray px-4 py-3 dark:border-strokedark dark:bg-meta-4">
              <FiSearch size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name or roll number…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-black focus:outline-none dark:text-white placeholder-gray-400"
              />
              {searching && (
                <span className="text-xs text-gray-400 shrink-0">Searching…</span>
              )}
            </div>

            {/* Dropdown results */}
            {searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
              >
                {searchResults.map((student) => (
                  <button
                    key={student._id}
                    type="button"
                    onClick={() => addStudent(student)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary shrink-0">
                      <FiUser size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Roll #{student.rollNumber} · {student.class?.name}
                        {student.class?.section && ` - ${student.class.section}`}
                      </p>
                    </div>
                    {student.class?.fee ? (
                      <span className="text-xs font-semibold text-primary shrink-0">
                        PKR {(student.class.fee * 12).toLocaleString()}/yr
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 shrink-0">No fee</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim() && !searching && searchResults.length === 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-gray-500 shadow dark:border-strokedark dark:bg-boxdark dark:text-gray-400">
                No students found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Selected students chip list */}
          {selectedStudents.length > 0 && (
            <div className="mt-3 rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
              <div className="bg-gray-50 dark:bg-meta-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Selected Students ({selectedStudents.length})
              </div>
              <div className="divide-y divide-stroke dark:divide-strokedark max-h-48 overflow-y-auto">
                {selectedStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-boxdark"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary shrink-0">
                        <FiUser size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Roll #{student.rollNumber} · {student.class?.name}
                          {student.class?.section && ` - ${student.class.section}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStudent(student._id)}
                      className="ml-3 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors shrink-0"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-5 flex items-center gap-3">
  <input
    type="checkbox"
    checked={autoAnnualStudents}
    onChange={(e) => {
  const checked = e.target.checked;
  setAutoAnnualStudents(checked);

  if (checked) {
    fetchAnnualStudents();
  }
}}
    className="h-4 w-4"
  />
  <label className="text-sm text-black dark:text-white">
    Automatically include all students with <b>Annual Fee Plan</b>
  </label>
</div>

        {/* ── Year & Due Date ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            />
          </div>
        </div>

        {/* ── Invoice Type & Description ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Invoice Type</label>
            <select
              value={formData.invoiceType}
              onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="annual">Annual</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Annual fee 2026"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
        </div>

        {/* ── Discount ────────────────────────────────────────────────────── */}
        <div className="mb-6 rounded-lg border border-stroke dark:border-strokedark p-4">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Discount (Annual Payment Incentive)
          </label>
          <div className="flex gap-3">
            {/* % / PKR toggle */}
            <div className="flex rounded-lg border border-stroke dark:border-strokedark overflow-hidden shrink-0">
              {['percentage', 'fixed'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: type, discount: '' })}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    formData.discountType === type
                      ? 'bg-primary text-white'
                      : 'bg-white text-black dark:bg-boxdark dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4'
                  }`}
                >
                  {type === 'percentage' ? '%' : 'PKR'}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              max={formData.discountType === 'percentage' ? 100 : undefined}
              placeholder={formData.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 5000'}
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-3 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
          {parseFloat(formData.discount) > 0 && selectedStudents.length > 0 && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {formData.discountType === 'percentage'
                ? `${formData.discount}% discount applied to each student's annual fee`
                : `PKR ${parseFloat(formData.discount).toLocaleString()} flat discount per student`}
            </p>
          )}
        </div>

        {/* ── Per-Student Invoice Breakdown ───────────────────────────────── */}
        {selectedStudents.length > 0 && (
          <div className="mb-6 rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-meta-4 px-4 py-2.5 flex items-center justify-between border-b border-stroke dark:border-strokedark">
              <span className="text-sm font-semibold text-black dark:text-white">
                Invoice Breakdown
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Monthly fee × 12
              </span>
            </div>

            {/* Per-student rows */}
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {selectedStudents.map((student) => {
                const monthly = parseFloat(student?.class?.fee) || 0;
                const annual  = monthly * 12;
                const disc    = getDiscountAmt(annual);
                const total   = getStudentTotal(student);

                return (
                  <div key={student._id} className="px-4 py-3 bg-white dark:bg-boxdark">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: name + formula */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        {monthly > 0 ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            PKR {monthly.toLocaleString()} × 12
                            {disc > 0 && (
                              <span className="text-green-500 ml-1">
                                − PKR {disc.toLocaleString()}
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-red-400 mt-0.5">Fee not set on class</p>
                        )}
                      </div>

                      {/* Right: original + discounted total */}
                      <div className="text-right shrink-0">
                        {disc > 0 && (
                          <p className="text-xs text-gray-400 line-through">
                            PKR {annual.toLocaleString()}
                          </p>
                        )}
                        <p className={`text-sm font-bold ${monthly > 0 ? 'text-primary' : 'text-gray-400'}`}>
                          {monthly > 0 ? `PKR ${total.toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grand total footer */}
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Subtotal ({selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''})</span>
                <span>PKR {grandSubtotal().toLocaleString()}</span>
              </div>
              {grandDiscount() > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Total Discount</span>
                  <span>− PKR {grandDiscount().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-blue-200 dark:border-blue-800 pt-2">
                <span className="font-bold text-black dark:text-white">Grand Total</span>
                <span className="text-xl font-bold text-primary">
                  PKR {grandTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Buttons ─────────────────────────────────────────────────────── */}
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
            disabled={loading || selectedStudents.length === 0}
            className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Generating…'
              : `Generate ${selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''} Invoice${selectedStudents.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateAnnualModal;