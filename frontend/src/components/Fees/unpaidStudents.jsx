import { useEffect, useState } from 'react';
import { FiDollarSign, FiEye } from 'react-icons/fi';
import { getUnpaidStudents, formatCurrency, formatDate, getStatusColor, formatStatus } from '../../services/feeService';
const apiUrl = import.meta.env.VITE_API_URL;

const UnpaidFeesList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeType, setFeeType] = useState('monthly'); // default Fees

  useEffect(() => {
    fetchUnpaidStudents();
  }, [feeType]);

  const fetchUnpaidStudents = async () => {
    try {
      setLoading(true);
      const response = await getUnpaidStudents({ type: feeType });
      setRecords(response.data || []);
    } catch (error) {
      console.error('Failed to fetch unpaid students:', error);
      alert('Failed to load unpaid fees list');
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
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-2xl font-bold text-black dark:text-white">
        Unpaid / Pending Fees
      </h4>
      <div className="mb-5 flex gap-3">
        <button
          onClick={() => setFeeType('monthly')}
          className={`rounded px-4 py-2 text-sm font-medium ${feeType === 'monthly'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-black dark:bg-meta-4 dark:text-white'
            }`}
        >
          Fees
        </button>

        <button
          onClick={() => setFeeType('others')}
          className={`rounded px-4 py-2 text-sm font-medium ${feeType === 'others'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-black dark:bg-meta-4 dark:text-white'
            }`}
        >
          Others
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <thead className="bg-gray-2 dark:bg-meta-4">
              <tr>
                <th className="p-2.5 text-left text-sm font-medium uppercase">Invoice #</th>
                <th className="p-2.5 text-left text-sm font-medium uppercase">Student</th>
                <th className="p-2.5 text-left text-sm font-medium uppercase">Class</th>
                <th className="p-2.5 text-left text-sm font-medium uppercase">Type</th>
                <th className="p-2.5 text-center text-sm font-medium uppercase">Total</th>
                <th className="p-2.5 text-center text-sm font-medium uppercase">Paid</th>
                <th className="p-2.5 text-center text-sm font-medium uppercase">Pending</th>
                <th className="p-2.5 text-center text-sm font-medium uppercase">Due Date</th>
                <th className="p-2.5 text-center text-sm font-medium uppercase">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {records.map((row) => (
                <tr key={row.invoiceId} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                  <td className="p-2.5 font-medium text-black dark:text-white">
                    {row.invoiceNumber}
                  </td>

                  <td className="p-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          row.student?.profilePic
                            ? `${apiUrl}/${row.student.profilePic}`
                            : 'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'
                        }
                        alt="profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          {row.student?.firstName} {row.student?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Roll: {row.student?.rollNumber}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-2.5 text-black dark:text-white">
                    {row.class?.name || '-'}
                  </td>

                  <td className="p-2.5 text-black dark:text-white">
                    {row.invoiceType || '-'}
                  </td>

                  <td className="p-2.5 text-center font-semibold">
                    {formatCurrency(row.totalAmount)}
                  </td>

                  <td className="p-2.5 text-center">
                    {formatCurrency(row.paidAmount)}
                  </td>

                  <td className="p-2.5 text-center text-red-600 font-bold">
                    {formatCurrency(row.remainingAmount)}
                  </td>

                  <td className="p-2.5 text-center">
                    {formatDate(row.dueDate)}
                  </td>

                  <td className="p-2.5 text-center">
                    {getStatusBadge(row.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {records.length === 0 && (
            <div className="py-10 text-center text-gray-600 dark:text-gray-400">
              No Results Found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnpaidFeesList;