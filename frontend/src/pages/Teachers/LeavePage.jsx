import React, { useEffect, useState, useCallback } from 'react';
import { applyLeave, getLeaveRequests } from '../../services/teacherApi';

const STATUS_STYLES = {
  Pending:  { bg: '#FEF3C7', color: '#F59E0B' },
  Approved: { bg: '#D1FAE5', color: '#10B981' },
  Rejected: { bg: '#FEE2E2', color: '#EF4444' },
};

const LEAVE_TYPES = ['Sick', 'Casual', 'Emergency', 'Medical', 'Family', 'Other'];

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #E2E8F0', fontSize: 14, color: '#1C2434',
  background: '#F7F9FC', outline: 'none', boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6
};

const EMPTY_FORM = {
  startDate: '', endDate: '', leaveType: 'Sick', reason: ''
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    getLeaveRequests({ page, limit: 8, status: filterStatus || undefined })
      .then(res => {
        setLeaves(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => showToast('Failed to load leave requests', 'error'))
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.startDate) > new Date(form.endDate)) {
      return showToast('End date must be after start date', 'error');
    }
    setSubmitting(true);
    try {
      await applyLeave(form);
      showToast('Leave application submitted!');
      setForm(EMPTY_FORM);
      setPage(1);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const daysBetween = (start, end) => {
    if (!start || !end) return 0;
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: toast.type === 'error' ? '#EF4444' : '#10B981',
          fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>Leave Requests</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Apply for leave and view request history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Apply Form */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 24
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C2434', margin: '0 0 20px' }}>
            Apply for Leave
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>LEAVE TYPE *</label>
              <select required style={inputStyle} value={form.leaveType}
                onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))}>
                {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>START DATE *</label>
              <input required type="date" style={inputStyle} value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>END DATE *</label>
              <input required type="date" style={inputStyle} value={form.endDate}
                min={form.startDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>

            {form.startDate && form.endDate && (
              <div style={{
                padding: '8px 12px', borderRadius: 8, background: '#EFF4FB',
                color: '#3C50E0', fontSize: 13, fontWeight: 600, marginBottom: 14
              }}>
                📅 {daysBetween(form.startDate, form.endDate)} day(s) requested
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>REASON *</label>
              <textarea
                required style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                value={form.reason}
                onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                placeholder="Briefly explain the reason for leave..."
                maxLength={1000}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                {form.reason.length}/1000
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: submitting ? '#94a3b8' : '#3C50E0',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer'
            }}>
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>

        {/* History */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C2434', margin: 0 }}>Leave History</h2>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              style={{ ...inputStyle, width: 130, padding: '7px 10px', fontSize: 13 }}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : leaves.length === 0 ? (
            <div style={{
              padding: 50, textAlign: 'center', color: '#94a3b8',
              background: '#fff', borderRadius: 12, border: '1px dashed #E2E8F0'
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <div>No leave requests found</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leaves.map(leave => (
                <div key={leave._id} style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
                  padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start'
                }}>
                  {/* Type badge */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#EFF4FB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
                  }}>
                    {leave.leaveType === 'Sick' ? '🤒' : leave.leaveType === 'Medical' ? '🏥' :
                      leave.leaveType === 'Emergency' ? '🚨' : leave.leaveType === 'Casual' ? '☀️' : '📋'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#1C2434', fontSize: 14 }}>{leave.leaveType} Leave</span>
                        <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>
                          {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: STATUS_STYLES[leave.status]?.bg,
                        color: STATUS_STYLES[leave.status]?.color
                      }}>{leave.status}</span>
                    </div>

                    <div style={{ color: '#64748b', fontSize: 13, margin: '4px 0' }}>
                      📅 {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </div>

                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                      {leave.reason}
                    </div>

                    {leave.reviewRemarks && (
                      <div style={{
                        marginTop: 8, padding: '6px 10px', borderRadius: 6,
                        background: STATUS_STYLES[leave.status]?.bg,
                        color: STATUS_STYLES[leave.status]?.color, fontSize: 12
                      }}>
                        Review note: {leave.reviewRemarks}
                      </div>
                    )}

                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
                      Applied {new Date(leave.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 32, height: 32, borderRadius: 6, border: 'none',
                  background: p === page ? '#3C50E0' : '#EFF4FB',
                  color: p === page ? '#fff' : '#64748b',
                  fontWeight: 600, cursor: 'pointer'
                }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
