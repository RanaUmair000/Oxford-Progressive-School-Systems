import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createStockItem, updateStockItem, getStockItemById, getSuppliers,
} from '../../services/stockService';

const CATEGORIES = ['Books', 'Uniforms', 'Stationery', 'Sports', 'Lab Equipment', 'Other'];

const EMPTY_FORM = {
  name: '', category: 'Stationery', supplier: '',
  purchasePrice: '', sellingPrice: '', quantityInStock: '',
  minimumStockAlert: 5, description: '',
};

const AddEditStockItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getSuppliers().then((r) => setSuppliers(r.data.data));
    if (isEdit) {
      getStockItemById(id).then((r) => {
        const d = r.data.data;
        setForm({
          name: d.name, category: d.category,
          supplier: d.supplier?._id || '',
          purchasePrice: d.purchasePrice, sellingPrice: d.sellingPrice,
          quantityInStock: d.quantityInStock, minimumStockAlert: d.minimumStockAlert,
          description: d.description,
        });
      });
    }
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Item name is required';
    if (!form.purchasePrice || form.purchasePrice <= 0) e.purchasePrice = 'Enter valid cost price';
    if (!form.sellingPrice || form.sellingPrice <= 0) e.sellingPrice = 'Enter valid selling price';
    if (form.quantityInStock === '' || form.quantityInStock < 0) e.quantityInStock = 'Quantity must be 0 or more';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { ...form, supplier: form.supplier || null };
      if (isEdit) {
        await updateStockItem(id, payload);
      } else {
        await createStockItem(payload);
      }
      navigate('/stock/items');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div>
          <h1 className="stock-page__title">{isEdit ? 'Edit Stock Item' : 'Add Stock Item'}</h1>
          <p className="stock-page__subtitle">Fill in the item details below</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            {/* Item Name */}
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                name="name" value={form.name} onChange={handleChange} placeholder="e.g. Math Textbook" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Supplier */}
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-select" name="supplier" value={form.supplier} onChange={handleChange}>
                <option value="">— Select Supplier —</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            {/* Purchase Price */}
            <div className="form-group">
              <label className="form-label">Purchase Price (PKR) *</label>
              <input className={`form-input ${errors.purchasePrice ? 'form-input--error' : ''}`}
                type="number" name="purchasePrice" value={form.purchasePrice}
                onChange={handleChange} placeholder="0" min="0" />
              {errors.purchasePrice && <p className="form-error">{errors.purchasePrice}</p>}
            </div>

            {/* Selling Price */}
            <div className="form-group">
              <label className="form-label">Selling Price (PKR) *</label>
              <input className={`form-input ${errors.sellingPrice ? 'form-input--error' : ''}`}
                type="number" name="sellingPrice" value={form.sellingPrice}
                onChange={handleChange} placeholder="0" min="0" />
              {errors.sellingPrice && <p className="form-error">{errors.sellingPrice}</p>}
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity in Stock *</label>
              <input className={`form-input ${errors.quantityInStock ? 'form-input--error' : ''}`}
                type="number" name="quantityInStock" value={form.quantityInStock}
                onChange={handleChange} placeholder="0" min="0" />
              {errors.quantityInStock && <p className="form-error">{errors.quantityInStock}</p>}
            </div>

            {/* Min Stock Alert */}
            <div className="form-group">
              <label className="form-label">Minimum Stock Alert</label>
              <input className="form-input" type="number" name="minimumStockAlert"
                value={form.minimumStockAlert} onChange={handleChange} min="0" />
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" value={form.description}
              onChange={handleChange} rows={3} placeholder="Optional notes about this item" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => navigate('/stock/items')}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditStockItem;