import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStockItems, deleteStockItem } from '../../services/stockService';
import StockTable from './StockTable';
import LowStockBadge from './LowStockBadge';
import { formatCurrency, formatDate, debounce } from '../../utils/stockHelpers';

const CATEGORIES = ['', 'Books', 'Uniforms', 'Stationery', 'Sports', 'Lab Equipment', 'Other'];

const StockItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchItems = useCallback(
    debounce((s, cat, low) => {
      setLoading(true);
      getStockItems({ search: s, category: cat, lowStock: low })
        .then((res) => setItems(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400),
    []
  );

  useEffect(() => { fetchItems(search, category, lowStockOnly); }, [search, category, lowStockOnly]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteStockItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Item Name' },
    { key: 'category', label: 'Category', render: (v) => <span className="badge badge--info">{v}</span> },
    { key: 'supplier', label: 'Supplier', render: (v) => v?.name || '—' },
    { key: 'purchasePrice', label: 'Cost Price', render: (v) => formatCurrency(v) },
    { key: 'sellingPrice', label: 'Selling Price', render: (v) => formatCurrency(v) },
    { key: 'quantityInStock', label: 'In Stock' },
    {
      key: 'quantityInStock', label: 'Status',
      render: (v, row) => <LowStockBadge qty={v} min={row.minimumStockAlert} />,
    },
    { key: 'createdAt', label: 'Date Added', render: (v) => formatDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="action-btns">
          <Link to={`/stock/items/${id}/edit`} className="btn btn--sm btn--outline">Edit</Link>
          <button className="btn btn--sm btn--danger" onClick={() => handleDelete(id, row.name)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div>
          <h1 className="stock-page__title">Stock Items</h1>
          <p className="stock-page__subtitle">{items.length} items in inventory</p>
        </div>
        <Link to="/stock/items/add" className="btn btn--primary">+ Add Item</Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
        <label className="filter-bar__toggle">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Low stock only
        </label>
      </div>

      <StockTable columns={columns} data={items} loading={loading} />
    </div>
  );
};

export default StockItemsList;