import React, { useEffect, useState } from 'react';
import { getStockDashboard } from '../../services/stockService';
import StatCard from './StatCard';
import StockTable from './StockTable';
import LowStockBadge from './LowStockBadge';
import { formatCurrency, formatDate } from '../../utils/stockHelpers';

const StockDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  const recentSalesColumns = [
    { key: 'student', label: 'Student', render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'item', label: 'Item', render: (v) => v?.name },
    { key: 'quantity', label: 'Qty' },
    { key: 'totalAmount', label: 'Amount', render: (v) => formatCurrency(v) },
    { key: 'saleDate', label: 'Date', render: (v) => formatDate(v) },
  ];

  const lowStockColumns = [
    { key: 'name', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantityInStock', label: 'In Stock' },
    { key: 'minimumStockAlert', label: 'Min Alert' },
    {
      key: 'quantityInStock', label: 'Status',
      render: (v, row) => <LowStockBadge qty={v} min={row.minimumStockAlert} />,
    },
  ];

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <h1 className="stock-page__title">Stock Dashboard</h1>
        <p className="stock-page__subtitle">Inventory overview & analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Stock Items"
          value={loading ? '...' : stats.totalItems}
          color="primary"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>}
        />
        <StatCard
          title="Total Stock Value"
          value={loading ? '...' : formatCurrency(stats.totalStockValue)}
          color="info"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>}
        />
        <StatCard
          title="Total Sales"
          value={loading ? '...' : formatCurrency(stats.totalSalesRevenue)}
          color="success"
          sub={`${stats.totalSalesCount || 0} transactions`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
        />
        <StatCard
          title="Total Profit"
          value={loading ? '...' : formatCurrency(stats.totalProfit)}
          color="success"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard
          title="Low Stock Alerts"
          value={loading ? '...' : stats.lowStockCount}
          color="warning"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <StatCard
          title="This Month Sales"
          value={loading ? '...' : formatCurrency(stats.monthlySales)}
          color="primary"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
      </div>

      {/* Most Sold Items */}
      <div className="stock-section">
        <h2 className="stock-section__title">Most Sold Items</h2>
        <StockTable
          loading={loading}
          data={data?.mostSoldItems || []}
          columns={[
            { key: 'item', label: 'Item', render: (v) => v?.name },
            { key: 'item', label: 'Category', render: (v) => v?.category },
            { key: 'totalQty', label: 'Total Sold' },
            { key: 'totalRevenue', label: 'Revenue', render: (v) => formatCurrency(v) },
          ]}
        />
      </div>

      {/* Low Stock */}
      {data?.lowStockItems?.length > 0 && (
        <div className="stock-section">
          <h2 className="stock-section__title">
            <span className="badge badge--warning" style={{ marginRight: 8 }}>!</span>
            Low Stock Alerts
          </h2>
          <StockTable
            loading={loading}
            data={data.lowStockItems}
            columns={lowStockColumns}
          />
        </div>
      )}

      {/* Recent Sales */}
      <div className="stock-section">
        <h2 className="stock-section__title">Recent Sales</h2>
        <StockTable
          loading={loading}
          data={data?.recentSales || []}
          columns={recentSalesColumns}
          emptyMessage="No sales yet."
        />
      </div>
    </div>
  );
};

export default StockDashboard;