import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSupplier, updateSupplier, getSupplierById } from '../../services/stockService';

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', notes: '' };

const AddEditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      getSupplierById(id).then((r) => {
        const d = r.data.data.supplier;
        setForm({ name: d.name, phone: d.phone, email: d.email, address: d.address, notes: d.notes });
      });
    }
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Supplier name is required';
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
      isEdit ? await updateSupplier(id, form) : await createSupplier(form);
      navigate('/stock/suppliers');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <h1 className="stock-page__title">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h1>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <div className="form-group">
              <label className="form-label">Supplier Name *</label>
              <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                name="name" value={form.name} onChange={handleChange} placeholder="ABC Suppliers" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="phone" value={form.phone}
                onChange={handleChange} placeholder="+92 300 0000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="supplier@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" value={form.address}
                onChange={handleChange} placeholder="Street, City" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" name="notes" value={form.notes}
              onChange={handleChange} rows={3} placeholder="Any additional notes..." />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => navigate('/stock/suppliers')}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditSupplier;