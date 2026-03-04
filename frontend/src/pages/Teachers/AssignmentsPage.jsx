import React, { useEffect, useState, useCallback } from 'react';
import {
  getAssignments, createAssignment, updateAssignment,
  deleteAssignment, getAssignedClasses
} from '../../services/teacherApi';

const statusBadge = {
  Published: { bg: '#D1FAE5', color: '#10B981' },
  Draft:     { bg: '#FEF3C7', color: '#F59E0B' },
  Closed:    { bg: '#F1F5F9', color: '#94a3b8' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isPastDue(dateStr) {
  return new Date(dateStr) < new Date();
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #E2E8F0', fontSize: 14, color: '#1C2434',
  background: '#F7F9FC', outline: 'none', boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6
};

const EMPTY_FORM = {
  title: '', description: '', classId: '', courseId: '',
  dueDate: '', totalMarks: 100, status: 'Published'
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    getAssignments({ page, limit: 10, status: filterStatus || undefined })
      .then(res => {
        setAssignments(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => showToast('Failed to load assignments', 'error'))
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getAssignedClasses().then(res => setClasses(res.data.data));
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal(true);
  };

  const openEdit = (a) => {
    setForm({
      title: a.title, description: a.description || '',
      classId: a.classId?._id || '', courseId: a.courseId?._id || '',
      dueDate: a.dueDate?.split('T')[0] || '', totalMarks: a.totalMarks,
      status: a.status
    });
    setEditId(a._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const academicYear = localStorage.getItem('academicYear') || '';
      const payload = { ...form, academicYear };
      if (editId) {
        await updateAssignment(editId, payload);
        showToast('Assignment updated!');
      } else {
        await createAssignment(payload);
        showToast('Assignment created!');
      }
      setModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      showToast('Assignment deleted');
      load();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const coursesForClass = form.classId
    ? (classes.find(c => c.classId === form.classId)?.courses || [])
    : [];

  const filtered = assignments.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative' }}>
      {/* Toast */}
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

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(28,36,52,.45)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
            padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C2434', margin: 0 }}>
                {editId ? 'Edit Assignment' : 'New Assignment'}
              </h2>
              <button onClick={() => setModal(false)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>TITLE *</label>
                <input required style={inputStyle} value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Assignment title" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Assignment details..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>CLASS *</label>
                  <select required style={inputStyle} value={form.classId}
                    onChange={e => setForm(p => ({ ...p, classId: e.target.value, courseId: '' }))}>
                    <option value="">Select class</option>
                    {classes.map(c => (
                      <option key={c.classId} value={c.classId}>
                        {c.className} {c.section ? `(${c.section})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>COURSE/SUBJECT *</label>
                  <select required style={inputStyle} value={form.courseId}
                    onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                    <option value="">Select course</option>
                    {coursesForClass.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>DUE DATE *</label>
                  <input required type="date" style={inputStyle} value={form.dueDate}
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>TOTAL MARKS</label>
                  <input type="number" style={inputStyle} value={form.totalMarks} min={1}
                    onChange={e => setForm(p => ({ ...p, totalMarks: Number(e.target.value) }))} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>STATUS</label>
                <select style={inputStyle} value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModal(false)} style={{
                  padding: '9px 20px', borderRadius: 8, border: '1px solid #E2E8F0',
                  background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{
                  padding: '9px 20px', borderRadius: 8, border: 'none',
                  background: '#3C50E0', color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>
                  {submitting ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>Assignments</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage your class assignments</p>
        </div>
        <button onClick={openCreate} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: '#3C50E0', color: '#fff', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
        }}>+ New Assignment</button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap'
      }}>
        <input
          placeholder="Search assignments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 220 }}
        />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: 140 }}>
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 120px 100px 100px',
          padding: '10px 20px', background: '#F7F9FC',
          fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '.5px', textTransform: 'uppercase'
        }}>
          <div>TITLE</div><div>CLASS</div><div>DUE DATE</div><div>STATUS</div><div>ACTIONS</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
            <div>No assignments found</div>
          </div>
        ) : (
          filtered.map((a, i) => (
            <div key={a._id} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 120px 100px 100px',
              padding: '14px 20px', alignItems: 'center',
              borderTop: '1px solid #EFF4FB',
              background: i % 2 === 0 ? '#fff' : '#FAFBFC'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1C2434' }}>{a.title}</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>{a.courseId?.name} · {a.totalMarks} marks</div>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {a.classId?.name || '—'}
              </div>
              <div style={{ fontSize: 13, color: isPastDue(a.dueDate) ? '#EF4444' : '#1C2434', fontWeight: isPastDue(a.dueDate) ? 600 : 400 }}>
                {formatDate(a.dueDate)}
                {isPastDue(a.dueDate) && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠️ Overdue</span>}
              </div>
              <div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: statusBadge[a.status]?.bg,
                  color: statusBadge[a.status]?.color
                }}>{a.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(a)} style={{
                  padding: '5px 10px', borderRadius: 6, border: '1px solid #E2E8F0',
                  background: '#EFF4FB', color: '#3C50E0', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>Edit</button>
                <button onClick={() => handleDelete(a._id)} style={{
                  padding: '5px 10px', borderRadius: 6, border: '1px solid #FEE2E2',
                  background: '#FEF2F2', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>Del</button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8, padding: 16,
            borderTop: '1px solid #E2E8F0'
          }}>
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
  );
}
