import { useState, useEffect } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import { getInvoiceById, formatCurrency, formatDate, getStatusColor, formatStatus } from '../../../services/feeService';
const apiUrl = import.meta.env.VITE_API_URL;

const InvoiceDetailsModal = ({ invoice: initialInvoice, onClose }) => {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceDetails();
  }, []);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await getInvoiceById(initialInvoice._id);
      setInvoice(response.data.invoice);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl flex justify-center py-10">
        <div  style={{padding: 50}} className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: "100%"}} className="w-[100%] max-w-4xl max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-black dark:text-white">
          Invoice Details
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-black hover:bg-gray-300 dark:bg-meta-4 dark:text-white"
          >
            <FiPrinter size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="mb-6 rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-black dark:text-white mb-1">
              {invoice.invoiceNumber}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Issued: {formatDate(invoice.createdAt)}
            </p>
          </div>
          {getStatusBadge(invoice.status)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Student</p>
            <div className="flex items-center gap-3">
              <img
                src={invoice.student?.profilePic ? `${apiUrl}/${invoice.student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                alt={invoice.student?.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-black dark:text-white">
                  {invoice.student?.firstName} {invoice.student?.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Roll #: {invoice.student?.rollNumber}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Class</p>
              <p className="font-semibold text-black dark:text-white">
                {invoice.class?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Due Date</p>
              <p className="font-semibold text-black dark:text-white">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="mb-6 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Invoice Title</p>
        <p className="text-lg font-semibold text-black dark:text-white">
          {invoice.title}
        </p>
        {invoice.notes && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {invoice.notes}
          </p>
        )}
      </div>

      {/* Fee Items */}
      <div className="mb-6 rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="bg-gray-100 dark:bg-meta-4 px-5 py-3">
          <h5 className="text-lg font-semibold text-black dark:text-white">
            Fee Breakdown
          </h5>
        </div>
        <div className="p-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="pb-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.feeItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3">
                    <p className="font-medium text-black dark:text-white">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    )}
                  </td>
                  <td className="py-3 text-right font-semibold text-black dark:text-white">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-stroke dark:border-strokedark">
                <td className="pt-3 text-right font-semibold text-black dark:text-white">
                  Total:
                </td>
                <td className="pt-3 text-right text-xl font-bold text-black dark:text-white">
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="mb-6 rounded-lg border border-stroke bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 dark:bg-opacity-20 dark:border-strokedark p-5">
        <h5 className="text-lg font-semibold text-black dark:text-white mb-3">
          Payment Summary
        </h5>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Total Amount:</span>
            <span className="font-bold text-black dark:text-white">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">Paid Amount:</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatCurrency(invoice.paidAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
            <span className="font-semibold text-black dark:text-white">Remaining Balance:</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(invoice.remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="mb-6 rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <div className="bg-gray-100 dark:bg-meta-4 px-5 py-3">
            <h5 className="text-lg font-semibold text-black dark:text-white">
              Payment History
            </h5>
          </div>
          <div className="p-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Receipt #
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Method
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 font-medium text-black dark:text-white">
                      {payment.receiptNumber}
                    </td>
                    <td className="py-3 text-black dark:text-white">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="py-3 text-black dark:text-white capitalize">
                      {payment.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 text-right font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-gray-200 px-6 py-2 font-medium text-black hover:bg-gray-300 dark:bg-meta-4 dark:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;