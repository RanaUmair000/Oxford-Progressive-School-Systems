// TeacherAttendancePage.jsx
// Teacher's own attendance: mark today + view monthly calendar + stats
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

const STATUS_META = {
  Present:  { color: '#059669', bg: 'rgba(5,150,105,0.12)',  dot: '#059669', label: 'Present'  },
  Absent:   { color: '#dc2626', bg: 'rgba(220,38,38,0.12)',  dot: '#dc2626', label: 'Absent'   },
  Leave:    { color: '#d97706', bg: 'rgba(217,119,6,0.12)',  dot: '#d97706', label: 'Leave'    },
  Late:     { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', dot: '#7c3aed', label: 'Late'     },
  'Half Day':{ color: '#0891b2',bg: 'rgba(8,145,178,0.12)',  dot: '#0891b2', label: 'Half Day' },
};

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' }) : '—';
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const pad = n => String(n).padStart(2, '0');
const toKey = d => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
};

// ── Mini Components ───────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.Present;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: m.bg, color: m.color
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      {m.label}
    </span>
  );
};

const StatBox = ({ label, value, color, bg }) => (
  <div style={{
    background: bg, borderRadius: 12, padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 100
  }}>
    <span style={{ fontSize: 24, fontWeight: 800, color, fontFamily: '"Syne", sans-serif' }}>{value}</span>
    <span style={{ fontSize: 11.5, color, opacity: 0.8, fontWeight: 500 }}>{label}</span>
  </div>
);

// ── Mark Attendance Form ──────────────────────────────────────────────────────
function MarkForm({ todayRecord, onSaved }) {
  const [form, setForm] = useState({
    date: todayStr(),
    status: todayRecord?.status || 'Present',
    checkInTime: todayRecord?.checkInTime || '',
    checkOutTime: todayRecord?.checkOutTime || '',
    remarks: todayRecord?.remarks || '',
    leaveType: todayRecord?.leaveType || '',
    leaveReason: todayRecord?.leaveReason || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (todayRecord) {
      setForm({
        date: todayStr(),
        status: todayRecord.status,
        checkInTime: todayRecord.checkInTime || '',
        checkOutTime: todayRecord.checkOutTime || '',
        remarks: todayRecord.remarks || '',
        leaveType: todayRecord.leaveType || '',
        leaveReason: todayRecord.leaveReason || '',
      });
    }
  }, [todayRecord]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/teacher-attendance/mark', form);
      setMsg({ type: 'success', text: todayRecord ? 'Attendance updated!' : 'Attendance marked!' });
      onSaved();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3500);
    }
  };

  const isLocked = todayRecord?.isApproved;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '28px 28px 24px',
      border: '1px solid #e8edf2', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: '"Syne", sans-serif' }}>
            📅 Today's Attendance
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
            {new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        {todayRecord && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusPill status={todayRecord.status} />
            {isLocked && (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
                ✓ Approved
              </span>
            )}
          </div>
        )}
      </div>

      {isLocked && (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#166534' }}>
          ✅ This attendance has been approved by admin and cannot be modified.
        </div>
      )}

      {msg && (
        <div style={{
          padding: '11px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13,
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: msg.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Status selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Status *
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(s => {
              const m = STATUS_META[s];
              const active = form.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={isLocked}
                  onClick={() => set('status', s)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                    border: active ? `2px solid ${m.color}` : '2px solid #e2e8f0',
                    background: active ? m.bg : '#f8fafc', color: active ? m.color : '#64748b'
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Check-in Time</label>
            <input type="time" value={form.checkInTime} disabled={isLocked}
              onChange={e => set('checkInTime', e.target.value)} style={inputStyle(isLocked)} />
          </div>
          <div>
            <label style={labelStyle}>Check-out Time</label>
            <input type="time" value={form.checkOutTime} disabled={isLocked}
              onChange={e => set('checkOutTime', e.target.value)} style={inputStyle(isLocked)} />
          </div>
        </div>

        {/* Leave fields */}
        {(form.status === 'Leave' || form.status === 'Half Day') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Leave Type</label>
              <select value={form.leaveType} disabled={isLocked}
                onChange={e => set('leaveType', e.target.value)} style={inputStyle(isLocked)}>
                <option value="">— Select —</option>
                {LEAVE_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Leave Reason</label>
              <input type="text" value={form.leaveReason} disabled={isLocked}
                placeholder="Brief reason…"
                onChange={e => set('leaveReason', e.target.value)} style={inputStyle(isLocked)} />
            </div>
          </div>
        )}

        {/* Remarks */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Remarks (optional)</label>
          <textarea value={form.remarks} disabled={isLocked} rows={2}
            placeholder="Any additional notes…"
            onChange={e => set('remarks', e.target.value)}
            style={{ ...inputStyle(isLocked), resize: 'vertical', minHeight: 60 }} />
        </div>

        {!isLocked && (
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0d7a6b, #009179)',
            color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s', letterSpacing: '0.02em'
          }}>
            {saving ? 'Saving…' : todayRecord ? '✏️ Update Attendance' : '✅ Mark Attendance'}
          </button>
        )}
      </form>
    </div>
  );
}

// ── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({ records, month, year, onMonthChange }) {
  const recordMap = {};
  records.forEach(r => { recordMap[toKey(r.date)] = r; });

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = todayStr();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8edf2', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      {/* Month Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: '"Syne", sans-serif' }}>
          {MONTHS[month - 1]} {year}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onMonthChange(-1)} style={navBtn}>‹</button>
          <button onClick={() => onMonthChange(1)}  style={navBtn}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const key = `${year}-${pad(month)}-${pad(day)}`;
          const rec = recordMap[key];
          const isToday = key === todayKey;
          const meta = rec ? STATUS_META[rec.status] : null;

          return (
            <div key={key} title={rec ? `${rec.status}${rec.checkInTime ? ' · ' + rec.checkInTime : ''}` : ''} style={{
              position: 'relative', borderRadius: 8, padding: '8px 4px',
              textAlign: 'center', fontSize: 12.5, fontWeight: isToday ? 800 : 500,
              background: meta ? meta.bg : isToday ? '#f1f8f6' : '#f8fafc',
              border: isToday ? '2px solid #009179' : '1px solid transparent',
              color: meta ? meta.color : isToday ? '#009179' : '#475569',
              cursor: rec ? 'pointer' : 'default', transition: 'transform 0.1s',
              minHeight: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>{day}</span>
              {meta && <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot }} />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f0f4f8' }}>
        {Object.entries(STATUS_META).map(([k, m]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── History Table ─────────────────────────────────────────────────────────────
function HistoryTable({ records }) {
  if (!records.length) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14, background: '#fff', borderRadius: 16, border: '1px solid #e8edf2' }}>
      📭 No records found for this period
    </div>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8edf2', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Date','Day','Status','Check-in','Check-out','Leave Type','Remarks','Approval'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8edf2', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafcfb', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f8f6'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafcfb'}
              >
                <td style={td}><strong>{fmtDate(r.date)}</strong></td>
                <td style={{ ...td, color: '#64748b' }}>
                  {new Date(r.date).toLocaleDateString('en-PK', { weekday: 'short' })}
                </td>
                <td style={td}><StatusPill status={r.status} /></td>
                <td style={{ ...td, color: '#64748b' }}>{r.checkInTime || '—'}</td>
                <td style={{ ...td, color: '#64748b' }}>{r.checkOutTime || '—'}</td>
                <td style={{ ...td, color: '#64748b' }}>{r.leaveType || '—'}</td>
                <td style={{ ...td, color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.remarks || '—'}
                </td>
                <td style={td}>
                  {r.isApproved
                    ? <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>✓ Approved</span>
                    : <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>⏳ Pending</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = (disabled) => ({
  width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13.5,
  border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a',
  background: disabled ? '#f8fafc' : '#fff', boxSizing: 'border-box',
  cursor: disabled ? 'not-allowed' : 'text'
});
const navBtn = {
  width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#f8fafc', cursor: 'pointer', fontSize: 16, display: 'flex',
  alignItems: 'center', justifyContent: 'center', color: '#475569'
};
const td = { padding: '12px 16px', borderBottom: '1px solid #f0f4f8', verticalAlign: 'middle' };

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeacherAttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [data, setData]   = useState({ records: [], stats: {}, todayRecord: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'history'

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/teacher-attendance/my', { params: { month, year } });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleMonthChange = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m); setYear(y);
  };

  const { records, stats, todayRecord } = data;

  return (
    <div style={{ padding: '24px', maxWidth: 1100, fontFamily: '"DM Sans", sans-serif' }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a', fontFamily: '"Syne", sans-serif' }}>
          My Attendance
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748b' }}>
          Mark your daily attendance and track your monthly record
        </p>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatBox label="Present"  value={stats.present  ?? 0} color="#059669" bg="rgba(5,150,105,0.09)"   />
          <StatBox label="Absent"   value={stats.absent   ?? 0} color="#dc2626" bg="rgba(220,38,38,0.09)"   />
          <StatBox label="Leave"    value={stats.leave    ?? 0} color="#d97706" bg="rgba(217,119,6,0.09)"   />
          <StatBox label="Late"     value={stats.late     ?? 0} color="#7c3aed" bg="rgba(124,58,237,0.09)"  />
          <StatBox label="Half Day" value={stats.halfDay  ?? 0} color="#0891b2" bg="rgba(8,145,178,0.09)"   />
          <div style={{
            flex: 1, minWidth: 120, borderRadius: 12, padding: '16px 20px',
            background: 'linear-gradient(135deg, #0d7a6b, #009179)',
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: '"Syne", sans-serif' }}>
              {stats.percentage ?? '0.0'}%
            </span>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Attendance Rate</span>
          </div>
          {(stats.pending ?? 0) > 0 && (
            <div style={{ minWidth: 120, borderRadius: 12, padding: '16px 20px', background: 'rgba(251,191,36,0.1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#d97706', fontFamily: '"Syne", sans-serif' }}>
                {stats.pending}
              </span>
              <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 500 }}>Pending Approval</span>
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: mark form */}
        <MarkForm todayRecord={todayRecord} onSaved={load} />

        {/* Right: calendar + history */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
            {[['calendar','📅 Calendar'],['history','📋 History']].map(([k, label]) => (
              <button key={k} onClick={() => setActiveTab(k)} style={{
                flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === k ? '#fff' : 'transparent',
                color: activeTab === k ? '#009179' : '#64748b',
                boxShadow: activeTab === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#009179', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
              Loading…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : activeTab === 'calendar' ? (
            <CalendarView records={records} month={month} year={year} onMonthChange={handleMonthChange} />
          ) : (
            <HistoryTable records={records} />
          )}
        </div>
      </div>
    </div>
  );
}