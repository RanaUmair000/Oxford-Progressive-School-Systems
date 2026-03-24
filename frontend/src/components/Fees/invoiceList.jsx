import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiDollarSign, FiDownload } from 'react-icons/fi';
import { getInvoices, deleteInvoice, formatCurrency, formatDate, getStatusColor, formatStatus } from '../../services/feeService';
import Modal from '../Modal/modal';
import InvoiceDetailsModal from './Modals/invoiceDetailsModal';
import SubmitPaymentModal from './Modals/submitPaymentModal';
import { InvoicePrintButton } from './InvoicePrintView';

const apiUrl = import.meta.env.VITE_API_URL;

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    invoiceType: '',
    month: '',
    year: new Date().getFullYear()
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.invoiceType) params.invoiceType = filters.invoiceType;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;

      const response = await getInvoices(params);
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      alert('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInvoices();
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice(invoiceId);
      alert('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setModalType('details');
  };

  const handleSubmitPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setModalType('payment');
  };

  const closeModal = () => {
    setSelectedInvoice(null);
    setModalType(null);
    fetchInvoices();
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex rounded-full ${color} px-3 py-1 text-xs font-medium text-white`}>
        {formatStatus(status)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      event: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {/* Header */}
        <div className="mb-6">
          <h4 className="text-2xl font-bold text-black dark:text-white mb-4">
            Fee Invoices
          </h4>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              placeholder="Search student..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
            </select>

            <select
              value={filters.invoiceType}
              onChange={(e) => setFilters({ ...filters, invoiceType: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="monthly">Monthly</option>
              <option value="event">Event</option>
              <option value="manual">Manual</option>
            </select>

            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

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
                      Invoice #
                    </th>
                    <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                      Student
                    </th>
                    <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                      Type
                    </th>
                    <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                      Title
                    </th>
                    <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                      Amount
                    </th>
                    <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                      Paid
                    </th>
                    <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                      Due Date
                    </th>
                    <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                      Status
                    </th>
                    <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                      <td className="p-2.5 text-black dark:text-white font-medium">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <img
                              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                              src={invoice.student?.profilePic ? `${apiUrl}/${invoice.student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                              alt={invoice.student?.firstName}
                            />
                          </div>
                          <div>
                            <p className="text-black dark:text-white font-medium">
                              {invoice.student?.firstName} {invoice.student?.lastName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {invoice.student?.rollNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="text-center p-2.5">
                        {getTypeBadge(invoice.invoiceType)}
                      </td>

                      <td className="p-2.5 text-black dark:text-white">
                        {invoice.title}
                      </td>

                      <td className="text-center p-2.5 text-black dark:text-white font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </td>

                      <td className="text-center p-2.5 text-black dark:text-white">
                        {formatCurrency(invoice.paidAmount)}
                      </td>

                      <td className="text-center p-2.5 text-black dark:text-white">
                        {formatDate(invoice.dueDate)}
                      </td>

                      <td className="text-center p-2.5">
                        {getStatusBadge(invoice.status)}
                      </td>

                      <td className="text-center p-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(invoice)}
                            className="rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>

                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => handleSubmitPayment(invoice)}
                              className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                              title="Submit Payment"
                            >
                              <FiDollarSign size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(invoice._id)}
                            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                          <InvoicePrintButton invoice={invoice} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {invoices.length === 0 && (
                <div className="py-10 text-center text-gray-600 dark:text-gray-400">
                  No invoices found
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modalType === 'details' && selectedInvoice && (
        <Modal isOpen={true} onClose={closeModal}>
          <InvoiceDetailsModal invoice={selectedInvoice} onClose={closeModal} />
        </Modal>
      )}

      {modalType === 'payment' && selectedInvoice && (
        <Modal isOpen={true} onClose={closeModal}>
          <SubmitPaymentModal invoice={selectedInvoice} onClose={closeModal} />
        </Modal>
      )}
    </>
  );
};

export default InvoiceList;