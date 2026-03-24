import React, { useEffect, useState } from 'react';
import { getStockItems, createSale } from '../../services/stockService';
import { formatCurrency } from '../../utils/stockHelpers';
// Import your existing student service/hook here:
// import { getStudents } from '../../../services/studentService';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const EMPTY_FORM = {
  student: '', item: '', quantity: 1, sellingPrice: '', saleDate: '', notes: '',
};

const SellItem = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);   // populated from existing student API
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    getStockItems().then((r) => setItems(r.data.data.filter((i) => i.quantityInStock > 0)));

    // ── Replace this with your existing student fetch ──────────────────────
    // getStudents({ search: studentSearch }).then(r => setStudents(r.data.data));
    // For now using a placeholder until you wire up your student service:
    fetch(`${apiUrl}/api/students?query=${studentSearch}&limit=30`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then((r) => r.json())
      .then((r) => setStudents(r.data || []))
      .catch(() => { });
  }, [studentSearch]);

  const handleItemChange = (e) => {
    const itemId = e.target.value;
    const found = items.find((i) => i._id === itemId);
    setSelectedItem(found || null);
    setForm((prev) => ({ ...prev, item: itemId, sellingPrice: found ? found.sellingPrice : '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.student) e.student = 'Select a student';
    if (!form.item) e.item = 'Select an item';
    if (!form.quantity || form.quantity < 1) e.quantity = 'Quantity must be at least 1';
    if (selectedItem && form.quantity > selectedItem.quantityInStock)
      e.quantity = `Only ${selectedItem.quantityInStock} in stock`;
    if (!form.sellingPrice || form.sellingPrice <= 0) e.sellingPrice = 'Enter valid price';
    if (!form.saleDate) e.saleDate = 'Select sale date';
    return e;
  };

  const totalAmount = (form.quantity || 0) * (form.sellingPrice || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await createSale({ ...form, totalAmount });
      setResult(res.data);
      setForm(EMPTY_FORM);
      setSelectedItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div>
          <h1 className="stock-page__title">Sell Item to Student</h1>
          <p className="stock-page__subtitle">Record a sale and auto-generate an invoice</p>
        </div>
      </div>

      {result && (
        <div className="alert alert--success">
          ✓ Sale recorded! Invoice <strong>{result.invoice?.invoiceNumber}</strong> generated for{' '}
          <strong>{formatCurrency(result.data?.totalAmount)}</strong>.
          <button className="alert__close" onClick={() => setResult(null)}>×</button>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">

            {/* Student Search */}
            <div className="form-group">
              <label className="form-label">Search Student</label>
              <input className="form-input" placeholder="Type name or roll number..."
                value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Select Student *</label>
              <select className={`form-select ${errors.student ? 'form-input--error' : ''}`}
                name="student" value={form.student} onChange={handleChange}>
                <option value="">— Select Student —</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} — {s.rollNumber}
                  </option>
                ))}
              </select>
              {errors.student && <p className="form-error">{errors.student}</p>}
            </div>

            {/* Item */}
            <div className="form-group">
              <label className="form-label">Item *</label>
              <select className={`form-select ${errors.item ? 'form-input--error' : ''}`}
                name="item" value={form.item} onChange={handleItemChange}>
                <option value="">— Select Item —</option>
                {items.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name} — Stock: {i.quantityInStock}
                  </option>
                ))}
              </select>
              {errors.item && <p className="form-error">{errors.item}</p>}
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className={`form-input ${errors.quantity ? 'form-input--error' : ''}`}
                type="number" name="quantity" value={form.quantity}
                onChange={handleChange} min="1"
                max={selectedItem?.quantityInStock || undefined} />
              {selectedItem && (
                <p className="form-hint">Available: {selectedItem.quantityInStock}</p>
              )}
              {errors.quantity && <p className="form-error">{errors.quantity}</p>}
            </div>

            {/* Selling Price */}
            <div className="form-group">
              <label className="form-label">Selling Price (PKR) *</label>
              <input className={`form-input ${errors.sellingPrice ? 'form-input--error' : ''}`}
                type="number" name="sellingPrice" value={form.sellingPrice}
                onChange={handleChange} placeholder="0" min="0" />
              {errors.sellingPrice && <p className="form-error">{errors.sellingPrice}</p>}
            </div>

            {/* Total Amount (readonly) */}
            <div className="form-group">
              <label className="form-label">Total Amount</label>
              <input className="form-input form-input--readonly" readOnly
                value={totalAmount ? `PKR ${totalAmount.toLocaleString()}` : '—'} />
            </div>

            {/* Sale Date */}
            <div className="form-group">
              <label className="form-label">Sale Date *</label>
              <input className={`form-input ${errors.saleDate ? 'form-input--error' : ''}`}
                type="date" name="saleDate" value={form.saleDate} onChange={handleChange} />
              {errors.saleDate && <p className="form-error">{errors.saleDate}</p>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" name="notes" value={form.notes}
              onChange={handleChange} rows={2} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Processing...' : `Sell & Generate Invoice`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;