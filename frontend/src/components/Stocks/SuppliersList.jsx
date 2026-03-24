import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSuppliers, deleteSupplier } from '../../services/stockService';
import StockTable from './StockTable';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getSuppliers({ search })
      .then((r) => setSuppliers(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) return;
    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Supplier Name' },
    { key: 'phone', label: 'Phone', render: (v) => v || '—' },
    { key: 'email', label: 'Email', render: (v) => v || '—' },
    { key: 'address', label: 'Address', render: (v) => v || '—' },
    { key: 'notes', label: 'Notes', render: (v) => v || '—' },
    {
      key: '_id', label: 'Actions',
      render: (id, row) => (
        <div className="action-btns">
          <Link to={`/stock/suppliers/${id}/edit`} className="btn btn--sm btn--outline">Edit</Link>
          <button className="btn btn--sm btn--danger" onClick={() => handleDelete(id, row.name)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div>
          <h1 className="stock-page__title">Suppliers</h1>
          <p className="stock-page__subtitle">{suppliers.length} suppliers registered</p>
        </div>
        <Link to="/stock/suppliers/add" className="btn btn--primary">+ Add Supplier</Link>
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="Search suppliers..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <StockTable columns={columns} data={suppliers} loading={loading} />
    </div>
  );
};

export default SuppliersList;