import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { getStudentFeeStatus, formatCurrency, formatDate, getStatusColor, formatStatus } from '../../../services/feeService';
const apiUrl = import.meta.env.VITE_API_URL;

const CheckFeeStatusModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('rollNumber'); // 'rollNumber' or 'studentId'
  const [searchValue, setSearchValue] = useState('');
  const [feeData, setFeeData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchValue) {
      alert('Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      const params = searchType === 'rollNumber' 
        ? { rollNumber: searchValue }
        : { studentId: searchValue };
      
      const response = await getStudentFeeStatus(params);
      setFeeData(response.data);
    } catch (error) {
      console.error('Failed to fetch fee status:', error);
      alert(error.response?.data?.message || 'Student not found');
      setFeeData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex rounded-full ${color} px-3 py-1 text-xs font-medium text-white`}>
        {formatStatus(status)}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto"  style={{maxWidth: "100%", margin: "0 auto", padding: "30px 30px"}}>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
        Check Student Fee Status
      </h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="rollNumber">Roll Number</option>
            <option value="studentId">Student ID</option>
          </select>

          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'rollNumber' ? 'Enter roll number' : 'Enter student ID'}
            className="rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            <FiSearch size={18} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {feeData && (
        <>
          {/* Student Info */}
          <div className="mb-6 rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-5">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={feeData.student.profilePic ? `${apiUrl}/${feeData.student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                alt={feeData.student.firstName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-black dark:text-white">
                  {feeData.student.firstName} {feeData.student.lastName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Roll #: {feeData.student.rollNumber} | Class: {feeData.student.class?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {feeData.summary.totalInvoices}
              </p>
            </div>

            <div className="rounded-lg border border-stroke bg-green-50 dark:border-strokedark dark:bg-green-900 dark:bg-opacity-20 p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {feeData.summary.paidInvoices}
              </p>
            </div>

            <div className="rounded-lg border border-stroke bg-red-50 dark:border-strokedark dark:bg-red-900 dark:bg-opacity-20 p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Unpaid</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {feeData.summary.unpaidInvoices}
              </p>
            </div>

            <div className="rounded-lg border border-stroke bg-orange-50 dark:border-strokedark dark:bg-orange-900 dark:bg-opacity-20 p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {feeData.summary.overdueInvoices}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mb-6 rounded-lg border border-stroke bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 dark:bg-opacity-20 dark:border-strokedark p-5">
            <h5 className="text-lg font-semibold text-black dark:text-white mb-3">
              Financial Summary
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Amount:</span>
                <span className="font-bold text-black dark:text-white">
                  {formatCurrency(feeData.summary.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Paid Amount:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(feeData.summary.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                <span className="font-semibold text-black dark:text-white">Pending Amount:</span>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(feeData.summary.pendingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
            <div className="bg-gray-100 dark:bg-meta-4 px-5 py-3">
              <h5 className="text-lg font-semibold text-black dark:text-white">
                Invoice History
              </h5>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {feeData.invoices.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-meta-4 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                        Invoice #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                        Title
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                        Paid
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {feeData.invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-meta-3">
                        <td className="px-4 py-3 text-sm text-black dark:text-white">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-black dark:text-white">
                          {invoice.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-black dark:text-white">
                          {formatCurrency(invoice.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-green-600 dark:text-green-400">
                          {formatCurrency(invoice.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-black dark:text-white">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(invoice.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                  No invoices found
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Close Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-gray-200 px-6 py-2 font-medium text-black hover:bg-gray-300 dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-80"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CheckFeeStatusModal;