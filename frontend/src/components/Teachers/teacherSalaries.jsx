import { useEffect, useState } from "react";
import { FiDollarSign } from "react-icons/fi";
import { formatCurrency, formatDate, getStatusColor, formatStatus } from "../../services/feeService";
const apiUrl = import.meta.env.VITE_API_URL;

const TeacherSalaryList = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        month: "",
        year: new Date().getFullYear(),
    });

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        try {
            setLoading(true);

            const query = new URLSearchParams({
                search: filters.search,
                status: filters.status,
                month: filters.month,
                year: filters.year,
            }).toString();

            const res = await fetch(
                `${apiUrl}/api/teachers/salaries?${query}`
            );
            console.log(res);
            const data = await res.json();
            setRecords(data.data);
        } catch (err) {
            alert("Failed to load salaries");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:bg-boxdark">
            <h4 className="mb-6 text-2xl font-bold text-black dark:text-white">
                Teacher Monthly Salaries
            </h4>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
                <input
                    placeholder="Search teacher..."
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                    className="rounded border px-4 py-2"
                />

                <select
                    value={filters.month}
                    onChange={e => setFilters({ ...filters, month: e.target.value })}
                    className="rounded border px-4 py-2"
                >
                    <option value="">All Months</option>
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(2000, i).toLocaleString("default", { month: "long" })}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                    className="rounded border px-4 py-2"
                >
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partial</option>
                </select>

                <button
                    onClick={fetchSalaries}
                    className="rounded bg-primary text-white px-6 py-2"
                >
                    Search
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="py-10 text-center">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead>
                            <tr>
                                <th className="p-2.5 text-left">Teacher</th>
                                <th className="p-2.5 text-center">Month</th>
                                <th className="p-2.5 text-center">Salary</th>
                                <th className="p-2.5 text-center">Paid</th>
                                <th className="p-2.5 text-center">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records && records.length > 0 ? (
                                records.map((r) => (
                                    <tr key={r._id}>
                                        <td className="p-2.5 font-medium">
                                            {r.teacher.firstName} {r.teacher.lastName}
                                        </td>

                                        <td className="text-center">
                                            {new Date(2000, r.month - 1).toLocaleString("default", { month: "long" })} {r.year}
                                        </td>

                                        <td className="text-center">
                                            {formatCurrency(r.basicSalary)}
                                        </td>

                                        <td className="text-center">
                                            {formatCurrency(r.paidAmount)}
                                        </td>

                                        <td className="text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-white ${getStatusColor(r.status)}`}
                                            >
                                                {formatStatus(r.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-6 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No salary records found
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherSalaryList;
