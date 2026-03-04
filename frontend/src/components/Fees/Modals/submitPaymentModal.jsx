import { useState } from 'react';
import { submitPayment, formatCurrency } from '../../../services/feeService';
const apiUrl = import.meta.env.VITE_API_URL;

const SubmitPaymentModal = ({ invoice, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: invoice.totalAmount - invoice.paidAmount,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    chequeNumber: '',
    bankName: '',
    notes: ''
  });

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;

  const handleAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    if (amount > remainingAmount) {
      alert(`Amount cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`);
      return;
    }
    setFormData({ ...formData, amount: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      await submitPayment({
        ...formData,
        invoiceId: invoice._id
      });
      alert('Payment submitted successfully');
      onClose();
    } catch (error) {
      console.error('Failed to submit payment:', error);
      alert(error.response?.data?.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
        Submit Payment
      </h3>

      {/* Invoice Summary */}
      <div className="mb-6 rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
        <div className="flex items-center gap-3 mb-4">
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
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Invoice Title:</span>
            <span className="font-medium text-black dark:text-white">{invoice.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
            <span className="font-semibold text-black dark:text-white">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already Paid:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(invoice.paidAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-stroke dark:border-strokedark">
            <span className="font-semibold text-black dark:text-white">Remaining Balance:</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Payment Amount (PKR)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            step="0.01"
            max={remainingAmount}
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-lg font-semibold text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            required
          />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Maximum: {formatCurrency(remainingAmount)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online Payment</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Conditional Fields Based on Payment Method */}
        {formData.paymentMethod === 'bank_transfer' && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="Enter transaction ID"
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
        )}

        {formData.paymentMethod === 'cheque' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Cheque Number
              </label>
              <input
                type="text"
                value={formData.chequeNumber}
                onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                placeholder="Enter cheque number"
                className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Enter bank name"
                className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
            </div>
          </div>
        )}

        {formData.paymentMethod === 'online' && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="Enter transaction/reference ID"
              className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Add any payment notes..."
            className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />
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
            className="rounded bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitPaymentModal;