import { useState, useEffect } from 'react';
import { FiEye, FiDownload } from 'react-icons/fi';
import { getPayments, formatCurrency, formatDate } from '../../services/feeService';
const apiUrl = import.meta.env.VITE_API_URL;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await getPayments(params);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPayments();
  };

  const getMethodBadge = (method) => {
    const colors = {
      cash: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      bank_transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cheque: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      online: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      card: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
        {method.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Header */}
      <div className="mb-6">
        <h4 className="text-2xl font-bold text-black dark:text-white mb-4">
          Payment History
        </h4>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online</option>
            <option value="card">Card</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Start Date"
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="End Date"
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />

          <button
            onClick={handleSearch}
            className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90"
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="bg-gray-2 dark:bg-meta-4">
                <tr>
                  <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                    Receipt #
                  </th>
                  <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                    Student
                  </th>
                  <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                    Invoice
                  </th>
                  <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                    Date
                  </th>
                  <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                    Method
                  </th>
                  <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                    Amount
                  </th>
                  <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                    <td className="p-2.5 text-black dark:text-white font-medium">
                      {payment.receiptNumber}
                    </td>

                    <td className="p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <img
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                            src={payment.student?.profilePic ? `${apiUrl}/${payment.student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                            alt={payment.student?.firstName}
                          />
                        </div>
                        <div>
                          <p className="text-black dark:text-white font-medium">
                            {payment.student?.firstName} {payment.student?.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {payment.student?.rollNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-2.5 text-black dark:text-white">
                      {payment.invoice?.invoiceNumber}
                    </td>

                    <td className="text-center p-2.5 text-black dark:text-white">
                      {formatDate(payment.paymentDate)}
                    </td>

                    <td className="text-center p-2.5">
                      {getMethodBadge(payment.paymentMethod)}
                    </td>

                    <td className="text-center p-2.5 text-black dark:text-white font-semibold">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="text-center p-2.5">
                      <button
                        className="rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
                        title="View Receipt"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payments.length === 0 && (
              <div className="py-10 text-center text-gray-600 dark:text-gray-400">
                No payments found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistory;