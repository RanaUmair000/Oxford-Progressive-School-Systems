import React, { useEffect, useState, useCallback } from 'react';
import { getSales, deleteSale } from '../../services/stockService';
import StockTable from './StockTable';
import { formatCurrency, formatDate, debounce } from '../../utils/stockHelpers';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSales = useCallback(
    debounce((s, sd, ed) => {
      setLoading(true);
      getSales({ search: s, startDate: sd, endDate: ed })
        .then((r) => { setSales(r.data.data); setSummary(r.data.summary || {}); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400),
    []
  );

  useEffect(() => { fetchSales(search, startDate, endDate); }, [search, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale? Stock will be restored and invoice deleted.')) return;
    try {
      await deleteSale(id);
      fetchSales(search, startDate, endDate);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      key: 'student', label: 'Student',
      render: (v) => v ? (
        <div>
          <p style={{ fontWeight: 600, margin: 0 }}>{v.firstName} {v.lastName}</p>
          <p style={{ fontSize: 12, color: 'var(--black)', opacity: 0.6, margin: 0 }}>{v.rollNumber}</p>
        </div>
      ) : '—',
    },
    { key: 'item', label: 'Item', render: (v) => v?.name || '—' },
    { key: 'item', label: 'Category', render: (v) => v?.category ? <span className="badge badge--info">{v.category}</span> : '—' },
    { key: 'quantity', label: 'Qty' },
    { key: 'sellingPrice', label: 'Unit Price', render: (v) => formatCurrency(v) },
    { key: 'totalAmount', label: 'Total', render: (v) => <strong>{formatCurrency(v)}</strong> },
    { key: 'saleDate', label: 'Date', render: (v) => formatDate(v) },
    {
      key: 'invoice', label: 'Invoice',
      render: (v) => v ? <span className="badge badge--success">Generated</span> : <span className="badge badge--warning">None</span>,
    },
    {
      key: '_id', label: 'Actions',
      render: (id) => (
        <button className="btn btn--sm btn--danger" onClick={() => handleDelete(id)}>Delete</button>
      ),
    },
  ];

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div>
          <h1 className="stock-page__title">Sales History</h1>
          <p className="stock-page__subtitle">{sales.length} sales records</p>
        </div>
      </div>

      {/* Summary Banner */}
      {!loading && (
        <div className="summary-banner">
          <div className="summary-banner__item">
            <span className="summary-banner__label">Total Revenue</span>
            <span className="summary-banner__value">{formatCurrency(summary.totalRevenue || 0)}</span>
          </div>
          <div className="summary-banner__item">
            <span className="summary-banner__label">Items Sold</span>
            <span className="summary-banner__value">{summary.totalItems || 0}</span>
          </div>
          <div className="summary-banner__item">
            <span className="summary-banner__label">Transactions</span>
            <span className="summary-banner__value">{sales.length}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <input className="form-input" placeholder="Search by student name or roll..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="filter-bar__date">
          <label className="form-label">From</label>
          <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-bar__date">
          <label className="form-label">To</label>
          <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        {(search || startDate || endDate) && (
          <button className="btn btn--outline" onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      <StockTable columns={columns} data={sales} loading={loading} emptyMessage="No sales found." />
    </div>
  );
};

export default SalesHistory;