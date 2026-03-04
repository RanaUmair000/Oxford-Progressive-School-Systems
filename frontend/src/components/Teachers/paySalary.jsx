import { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const PayTeacherSalary = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    teacherId: "",
    month: "",
    year: new Date().getFullYear(),
    basicSalary: 0,
    paidAmount: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const res = await axios.get(`${apiUrl}/api/teachers`);
    setTeachers(res.data.data);
  };

  const handleTeacherChange = (id) => {
    const teacher = teachers.find(t => t._id === id);

    setForm(prev => ({
      ...prev,
      teacherId: id,
      basicSalary: teacher?.salary || 0,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${apiUrl}/api/teachers/salaries/pay`, form);
      alert("Salary paid successfully");
      window.location.href = "/teachers";
      setForm({ ...form, paidAmount: "", notes: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pay salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default dark:bg-boxdark">
      <h4 className="mb-6 text-2xl font-bold text-black dark:text-white">
        Pay Teacher Salary
      </h4>

      {/* Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">

        {/* Teacher */}
        <select
          className="rounded border px-4 py-2"
          value={form.teacherId}
          onChange={(e) => handleTeacherChange(e.target.value)}
        >
          <option value="">Select Teacher</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          className="rounded border px-4 py-2"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
        >
          <option value="">Select Month</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year */}
        <input
          type="number"
          className="rounded border px-4 py-2"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />

        {/* Basic Salary */}
        <input
          type="number"
          className="rounded border px-4 py-2 bg-gray-100 text-gray-600"
          value={form.basicSalary}
        />

        {/* Paid Amount */}
        <input
          type="number"
          placeholder="Paid Amount"
          className="rounded border px-4 py-2"
          value={form.paidAmount}
          onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
        />

        {/* Notes */}
        <textarea
          placeholder="Notes (optional)"
          className="rounded border px-4 py-2 sm:col-span-2"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded bg-primary px-6 py-2 text-white"
      >
        {loading ? "Processing..." : "Pay Salary"}
      </button>
    </div>
  );
};

export default PayTeacherSalary;
