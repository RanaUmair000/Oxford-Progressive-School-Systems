// AdminTeacherAttendancePage.jsx
// Admin portal: view all teachers attendance, mark/approve, stats
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: apiUrl });
api.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Present', 'Absent', 'Leave', 'Late', 'Half Day'];
const LEAVE_TYPES    = ['Sick', 'Casual', 'Emergency', 'Medical', 'Family', 'Maternity', 'Paternity', 'Other'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const STATUS_META = {
  Present:  { color: '#059669', bg: 'rgba(5,150,105,0.10)',  label: 'Present'   },
  Absent:   { color: '#dc2626', bg: 'rgba(220,38,38,0.10)',  label: 'Absent'    },
  Leave:    { color: '#d97706', bg: 'rgba(217,119,6,0.10)',  label: 'Leave'     },
  Late:     { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Late'      },
  'Half Day':{ color:'#0891b2', bg:'rgba(8,145,178,0.10)',   label: 'Half Day'  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' }) : '—';
const todayISO = () => {
  const d = new Date();
  return d.toLocaleDateString('en-CA');
};
// ── Sub-components ────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const m = STATUS_META[status];
  if (!m) return <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '20px 22px', flex: 1, minWidth: 130,
    border: '1px solid #e8edf2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }}>
    <div>
      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: color || '#0f172a', fontFamily: '"Syne", sans-serif' }}>{value}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{sub}</p>}
    </div>
    <div style={{ fontSize: 28, opacity: 0.8 }}>{icon}</div>
  </div>
);

// ── Mark Modal ────────────────────────────────────────────────────────────────
function MarkModal({ teachers, record, onClose, onSaved }) {
  const [form, setForm] = useState({
    teacherId: record?.teacherId?._id || record?.teacherId || '',
    date: record?.date ? new Date(record.date).toISOString().split('T')[0] : todayISO(),
    status: record?.status || 'Present',
    checkInTime: record?.checkInTime || '',
    checkOutTime: record?.checkOutTime || '',
    leaveType: record?.leaveType || '',
    leaveReason: record?.leaveReason || '',
    remarks: record?.remarks || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.teacherId || !form.date || !form.status) {
      setErr('Teacher, date and status are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/teacher-attendance/admin/mark', form);
      onSaved('Attendance marked successfully');
      onClose();
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #e8edf2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: '"Syne", sans-serif' }}>
            {record ? 'Edit Attendance' : '+ Mark Attendance'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {err && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#991b1b', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Teacher *</label>
            <select value={form.teacherId} onChange={e => set('teacherId', e.target.value)} style={inp} required>
              <option value="">— Select Teacher —</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} required />
            </div>
            <div>
              <label style={lbl}>Status *</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inp} required>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Check-in</label>
              <input type="time" value={form.checkInTime} onChange={e => set('checkInTime', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Check-out</label>
              <input type="time" value={form.checkOutTime} onChange={e => set('checkOutTime', e.target.value)} style={inp} />
            </div>
          </div>

          {(form.status === 'Leave' || form.status === 'Half Day') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Leave Type</label>
                <select value={form.leaveType} onChange={e => set('leaveType', e.target.value)} style={inp}>
                  <option value="">— Select —</option>
                  {LEAVE_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Reason</label>
                <input type="text" value={form.leaveReason} onChange={e => set('leaveReason', e.target.value)} style={inp} placeholder="Brief reason…" />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Remarks</label>
            <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 13.5, color: '#475569', fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#009179', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 700 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const lbl = { display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13.5, color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box' };
const thStyle = { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap', background: '#f8fafc' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f0f4f8', verticalAlign: 'middle', fontSize: 13.5 };

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminTeacherAttendancePage() {
  const now = new Date();
  const [filterDate, setFilterDate]       = useState(todayISO());
  const [filterMonth, setFilterMonth]     = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear]       = useState(now.getFullYear());
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [viewMode, setViewMode]           = useState('date'); // 'date' | 'month'
  const [records, setRecords]             = useState([]);
  const [teachers, setTeachers]           = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [pagination, setPagination]       = useState({});
  const [page, setPage]                   = useState(1);
  const [showModal, setShowModal]         = useState(false);
  const [editRecord, setEditRecord]       = useState(null);
  const [toast, setToast]                 = useState(null);

  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTeachers = async () => {
    try {
      const res = await api.get('/api/teachers');
      setTeachers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { /* silent */ }
  };

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/api/teacher-attendance/admin/stats', { params: { date: filterDate } });
      setStats(res.data.data);
    } catch { /* silent */ }
  }, [filterDate]);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filterTeacher) params.teacherId = filterTeacher;
      if (filterStatus)  params.status    = filterStatus;
      if (viewMode === 'date') {
        params.date = filterDate;
      } else {
        params.month = filterMonth;
        params.year  = filterYear;
      }
      const res = await api.get('/api/teacher-attendance/admin', { params });
      setRecords(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filterTeacher, filterStatus, viewMode, filterDate, filterMonth, filterYear]);

  useEffect(() => { loadTeachers(); }, []);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/teacher-attendance/admin/approve/${id}`);
      flash('Attendance approved');
      loadRecords();
    } catch { flash('Failed to approve', 'error'); }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Approve all pending records for ${fmtDate(filterDate)}?`)) return;
    try {
      const res = await api.put('/api/teacher-attendance/admin/approve-bulk', { date: filterDate });
      flash(res.data.message);
      loadRecords(); loadStats();
    } catch { flash('Failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await api.delete(`/api/teacher-attendance/admin/${id}`);
      flash('Record deleted');
      loadRecords(); loadStats();
    } catch { flash('Failed to delete', 'error'); }
  };

  const pendingCount = records.filter(r => !r.isApproved).length;

  return (
    <div style={{ padding: '24px', maxWidth: 1300, fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '13px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: toast.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a', fontFamily: '"Syne", sans-serif' }}>
            Teacher Attendance
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748b' }}>
            Manage and approve teacher attendance records
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {pendingCount > 0 && viewMode === 'date' && (
            <button onClick={handleBulkApprove} style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(217,119,6,0.1)', color: '#d97706', fontWeight: 700, fontSize: 13.5
            }}>
              ⏳ Approve All Pending ({pendingCount})
            </button>
          )}
          <button onClick={() => { setEditRecord(null); setShowModal(true); }} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #0d7a6b, #009179)', color: '#fff', fontWeight: 700, fontSize: 13.5
          }}>
            + Mark Attendance
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="✅" label="Present"   value={stats.present}   color="#059669" />
          <StatCard icon="❌" label="Absent"    value={stats.absent}    color="#dc2626" />
          <StatCard icon="🌿" label="On Leave"  value={stats.leave}     color="#d97706" />
          <StatCard icon="🕐" label="Late"      value={stats.late}      color="#7c3aed" />
          <StatCard icon="📋" label="Total Marked" value={stats.totalMarked} />
          <StatCard icon="⏳" label="Pending Approval" value={stats.pendingApproval} color="#d97706"
            sub="across all dates" />
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 20,
        border: '1px solid #e8edf2', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* View mode toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
          {[['date','By Date'],['month','By Month']].map(([k, l]) => (
            <button key={k} onClick={() => { setViewMode(k); setPage(1); }} style={{
              padding: '7px 14px', borderRadius: 6, border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              background: viewMode === k ? '#fff' : 'transparent',
              color: viewMode === k ? '#009179' : '#64748b',
              boxShadow: viewMode === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}>{l}</button>
          ))}
        </div>

        {viewMode === 'date' ? (
          <input type="date" value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            style={{ ...inp, maxWidth: 170 }} />
        ) : (
          <>
            <select value={filterMonth} onChange={e => { setFilterMonth(Number(e.target.value)); setPage(1); }} style={{ ...inp, maxWidth: 150 }}>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <input type="number" value={filterYear} min={2020} max={2030}
              onChange={e => { setFilterYear(Number(e.target.value)); setPage(1); }}
              style={{ ...inp, maxWidth: 100 }} />
          </>
        )}

        <select value={filterTeacher} onChange={e => { setFilterTeacher(e.target.value); setPage(1); }} style={{ ...inp, maxWidth: 200 }}>
          <option value="">All Teachers</option>
          {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
        </select>

        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ ...inp, maxWidth: 150 }}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(filterTeacher || filterStatus) && (
          <button onClick={() => { setFilterTeacher(''); setFilterStatus(''); setPage(1); }}
            style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>
            Clear ×
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8edf2', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#009179', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            Loading records…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>
            📭 No attendance records found for the selected filters
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Teacher','Date','Status','Check-in','Check-out','Leave','Marked By','Approval','Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => {
                  const teacher = r.teacherId || {};
                  return (
                    <tr key={r._id}
                      style={{ background: i % 2 === 0 ? '#fff' : '#fafcfb', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f8f6'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafcfb'}
                    >
                      {/* Teacher */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #0d7a6b, #009179)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: '#fff'
                          }}>
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>
                              {teacher.firstName} {teacher.lastName}
                            </div>
                            {teacher.subject && <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{teacher.subject}</div>}
                          </div>
                        </div>
                      </td>

                      <td style={{ ...tdStyle, color: '#475569', fontWeight: 500 }}>{fmtDate(r.date)}</td>
                      <td style={tdStyle}><StatusPill status={r.status} /></td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{r.checkInTime || '—'}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{r.checkOutTime || '—'}</td>
                      <td style={{ ...tdStyle, color: '#64748b', fontSize: 12.5 }}>
                        {r.leaveType ? <span style={{ background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: 12, fontWeight: 600, fontSize: 11 }}>{r.leaveType}</span> : '—'}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12 }}>
                        {r.isSelfMarked
                          ? <span style={{ color: '#7c3aed', fontWeight: 600 }}>Self</span>
                          : <span style={{ color: '#0891b2', fontWeight: 600 }}>Admin</span>}
                      </td>
                      <td style={tdStyle}>
                        {r.isApproved
                          ? <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>✓ Approved</span>
                          : (
                            <button onClick={() => handleApprove(r._id)} style={{
                              fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '4px 10px',
                              borderRadius: 20, fontWeight: 700, border: 'none', cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fde68a'}
                              onMouseLeave={e => e.currentTarget.style.background = '#fef3c7'}
                            >
                              ⏳ Approve
                            </button>
                          )
                        }
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditRecord(r); setShowModal(true); }} style={{
                            padding: '5px 10px', borderRadius: 7, border: 'none', background: '#eff6ff',
                            color: '#3b82f6', cursor: 'pointer', fontSize: 12, fontWeight: 600
                          }}>✏️</button>
                          <button onClick={() => handleDelete(r._id)} style={{
                            padding: '5px 10px', borderRadius: 7, border: 'none', background: '#fef2f2',
                            color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600
                          }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: page <= 1 ? '#f8fafc' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, color: '#475569' }}>
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', fontSize: 13, color: '#64748b' }}>
            Page {page} of {pagination.pages}
          </span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: page >= pagination.pages ? '#f8fafc' : '#fff', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer', fontSize: 13, color: '#475569' }}>
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <MarkModal
          teachers={teachers}
          record={editRecord}
          onClose={() => { setShowModal(false); setEditRecord(null); }}
          onSaved={msg => { flash(msg); loadRecords(); loadStats(); }}
        />
      )}
    </div>
  );
}