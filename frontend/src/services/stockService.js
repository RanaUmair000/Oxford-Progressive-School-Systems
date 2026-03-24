import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const BASE = apiUrl + '/api/stock';

// ── Items ────────────────────────────────────────────────
export const getStockItems = (params = {}) => axios.get(`${BASE}/items`, { params });
export const getStockItemById = (id) => axios.get(`${BASE}/items/${id}`);
export const createStockItem = (data) => axios.post(`${BASE}/items`, data);
export const updateStockItem = (id, data) => axios.put(`${BASE}/items/${id}`, data);
export const deleteStockItem = (id) => axios.delete(`${BASE}/items/${id}`);

// ── Suppliers ────────────────────────────────────────────
export const getSuppliers = (params = {}) => axios.get(`${BASE}/suppliers`, { params });
export const getSupplierById = (id) => axios.get(`${BASE}/suppliers/${id}`);
export const createSupplier = (data) => axios.post(`${BASE}/suppliers`, data);
export const updateSupplier = (id, data) => axios.put(`${BASE}/suppliers/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`${BASE}/suppliers/${id}`);

// ── Purchases ────────────────────────────────────────────
export const getPurchases = (params = {}) => axios.get(`${BASE}/purchases`, { params });
export const createPurchase = (data) => axios.post(`${BASE}/purchases`, data);
export const deletePurchase = (id) => axios.delete(`${BASE}/purchases/${id}`);

// ── Sales ────────────────────────────────────────────────
export const getSales = (params = {}) => axios.get(`${BASE}/sales`, { params });
export const createSale = (data) => axios.post(`${BASE}/sales`, data);
export const deleteSale = (id) => axios.delete(`${BASE}/sales/${id}`);

// ── Dashboard ────────────────────────────────────────────
export const getStockDashboard = () => axios.get(`${BASE}/dashboard`);