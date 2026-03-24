import React, { useEffect, useState } from 'react';
import { getStockItems, getSuppliers, createPurchase, getPurchases, deletePurchase } from '../../services/stockService';
import StockTable from './StockTable';
import { formatCurrency, formatDate } from '../../utils/stockHelpers';

const EMPTY_FORM = {
  item: '', supplier: '', quantityPurchased: '', purchasePrice: '', purchaseDate: '', notes: '',
};

const PurchaseStock = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getStockItems().then((r) => setItems(r.data.data));
    getSuppliers().then((r) => setSuppliers(r.data.data));
    fetchPurchases();
  }, []);

  const fetchPurchases = () => {
    setTableLoading(true);
    getPurchases().then((r) => setPurchases(r.data.data)).finally(() => setTableLoading(false));
  };

  // Auto-fill purchase price when item is selected
  const handleItemChange = (e) => {
    const itemId = e.target.value;
    const selected = items.find((i) => i._id === itemId);
    setForm((prev) => ({
      ...prev,
      item: itemId,
      purchasePrice: selected ? selected.purchasePrice : '',
      supplier: selected?.supplier?._id || prev.supplier,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.item) e.item = 'Select an item';
    if (!form.quantityPurchased || form.quantityPurchased <= 0) e.quantityPurchased = 'Enter valid quantity';
    if (!form.purchasePrice || form.purchasePrice <= 0) e.purchasePrice = 'Enter valid price';
    if (!form.purchaseDate) e.purchaseDate = 'Select purchase date';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const totalCost = (form.quantityPurchased || 0) * (form.purchasePrice || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await createPurchase({ ...form, supplier: form.supplier || null });
      setSuccessMsg(res.data.message);
      setForm(EMPTY_FORM);
      fetchPurchases();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase? Stock will be reversed.')) return;
    try {
      await deletePurchase(id);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'item', label: 'Item', render: (v) => v?.name },
    { key: 'supplier', label: 'Supplier', render: (v) => v?.name || '—' },
    { key: 'quantityPurchased', label: 'Qty' },
    { key: 'purchasePrice', label: 'Unit Price', render: (v) => formatCurrency(v) },
    { key: 'totalCost', label: 'Total Cost', render: (v) => formatCurrency(v) },
    { key: 'purchaseDate', label: 'Date', render: (v) => formatDate(v) },
    { key: 'notes', label: 'Notes', render: (v) => v || '—' },
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
          <h1 className="stock-page__title">Purchase Stock</h1>
          <p className="stock-page__subtitle">Record items received from suppliers</p>
        </div>
      </div>

      {successMsg && <div className="alert alert--success">{successMsg}</div>}

      {/* Purchase Form */}
      <div className="form-card">
        <h2 className="form-card__title">New Purchase Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <div className="form-group">
              <label className="form-label">Item *</label>
              <select className={`form-select ${errors.item ? 'form-input--error' : ''}`}
                name="item" value={form.item} onChange={handleItemChange}>
                <option value="">— Select Item —</option>
                {items.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.category})</option>)}
              </select>
              {errors.item && <p className="form-error">{errors.item}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-select" name="supplier" value={form.supplier} onChange={handleChange}>
                <option value="">— Select Supplier —</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Purchased *</label>
              <input className={`form-input ${errors.quantityPurchased ? 'form-input--error' : ''}`}
                type="number" name="quantityPurchased" value={form.quantityPurchased}
                onChange={handleChange} placeholder="0" min="1" />
              {errors.quantityPurchased && <p className="form-error">{errors.quantityPurchased}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Price (per unit) *</label>
              <input className={`form-input ${errors.purchasePrice ? 'form-input--error' : ''}`}
                type="number" name="purchasePrice" value={form.purchasePrice}
                onChange={handleChange} placeholder="0" min="0" />
              {errors.purchasePrice && <p className="form-error">{errors.purchasePrice}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Date *</label>
              <input className={`form-input ${errors.purchaseDate ? 'form-input--error' : ''}`}
                type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
              {errors.purchaseDate && <p className="form-error">{errors.purchaseDate}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Total Cost</label>
              <input className="form-input form-input--readonly" readOnly
                value={totalCost ? `PKR ${totalCost.toLocaleString()}` : '—'} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" name="notes" value={form.notes}
              onChange={handleChange} rows={2} placeholder="Optional notes..." />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Recording...' : 'Record Purchase'}
            </button>
          </div>
        </form>
      </div>

      {/* Purchase History */}
      <div className="stock-section" style={{ marginTop: 32 }}>
        <h2 className="stock-section__title">Purchase History</h2>
        <StockTable columns={columns} data={purchases} loading={tableLoading} />
      </div>
    </div>
  );
};

export default PurchaseStock;