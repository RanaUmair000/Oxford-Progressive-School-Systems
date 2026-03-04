import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const API_URL = `${apiUrl}/api/fees`;

// ========== Invoice APIs ==========

export const generateMonthlyInvoices = async (data) => {
  const response = await axios.post(`${API_URL}/invoices/generate-monthly`, data);
  return response.data;
};

export const getUnpaidStudents = async (params = {}) => {
  const response = await axios.get(`${API_URL}/invoices/unpaid-students`, { params });
  return response.data;
};

export const createStudentInvoice = async (data) => {
  const response = await axios.post(`${API_URL}/invoices/student`, data);
  return response.data;
};

export const generateEventInvoices = async (data) => {
  const response = await axios.post(`${API_URL}/invoices/generate-event`, data);
  return response.data;
};

export const getInvoices = async (params = {}) => {
  const response = await axios.get(`${API_URL}/invoices`, { params });
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await axios.get(`${API_URL}/invoices/${id}`);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${API_URL}/invoices/${id}`);
  return response.data;
};

export const getStudentFeeStatus = async (params) => {
  const response = await axios.get(`${API_URL}/students/fee-status`, { params });
  return response.data;
};

// ========== Payment APIs ==========

export const submitPayment = async (data) => {
  const response = await axios.post(`${API_URL}/payments`, data);
  return response.data;
};

export const getPayments = async (params = {}) => {
  const response = await axios.get(`${API_URL}/payments`, { params });
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await axios.get(`${API_URL}/payments/${id}`);
  return response.data;
};

export const getPaymentReceipt = async (id) => {
  const response = await axios.get(`${API_URL}/payments/${id}/receipt`);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await axios.delete(`${API_URL}/payments/${id}`);
  return response.data;
};

export const getPaymentStats = async (params = {}) => {
  const response = await axios.get(`${API_URL}/payments/stats/summary`, { params });
  return response.data;
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Helper function to format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get status badge color
export const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-500';
    case 'partially_paid':
      return 'bg-yellow-500';
    case 'unpaid':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Helper function to format status text
export const formatStatus = (status) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default {
  generateMonthlyInvoices,
  createStudentInvoice,
  generateEventInvoices,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  getStudentFeeStatus,
  submitPayment,
  getPayments,
  getPaymentById,
  getPaymentReceipt,
  deletePayment,
  getPaymentStats,
  formatCurrency,
  formatDate,
  getStatusColor,
  formatStatus
};