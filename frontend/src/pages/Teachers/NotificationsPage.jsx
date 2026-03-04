import React, { useEffect, useState, useCallback } from 'react';
import { getNotifications, markAllNotificationsRead } from '../../services/teacherApi';

const TYPE_ICONS = {
  Announcement: { icon: '📢', color: '#3C50E0' },
  Assignment:   { icon: '📝', color: '#F59E0B' },
  Exam:         { icon: '📋', color: '#EF4444' },
  Leave:        { icon: '📅', color: '#6366F1' },
  Alert:        { icon: '🚨', color: '#EF4444' },
  General:      { icon: '🔔', color: '#10B981' },
};

const PRIORITY_BADGE = {
  High:   { bg: '#FEE2E2', color: '#EF4444' },
  Medium: { bg: '#FEF3C7', color: '#F59E0B' },
  Low:    { bg: '#F1F5F9', color: '#94a3b8' },
};

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filterType, setFilterType] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    getNotifications({ page, limit: 15 })
      .then(res => {
        setNotifications(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => showToast('Failed to load notifications', 'error'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read');
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n =>
    !filterType || n.type === filterType
  );

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

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 10, background: '#EF4444', color: '#fff',
                borderRadius: 20, padding: '2px 10px', fontSize: 14
              }}>{unreadCount}</span>
            )}
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Announcements, reminders and alerts</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{
            padding: '9px 16px', borderRadius: 8, border: '1px solid #E2E8F0',
            background: '#fff', color: '#3C50E0', fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}>
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {['', 'Announcement', 'Assignment', 'Exam', 'Leave', 'General', 'Alert'].map(type => (
          <button key={type} onClick={() => setFilterType(type)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none',
            background: filterType === type ? '#3C50E0' : '#EFF4FB',
            color: filterType === type ? '#fff' : '#64748b',
            fontWeight: 600, fontSize: 12, cursor: 'pointer'
          }}>
            {type || 'All'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: 60, textAlign: 'center', color: '#94a3b8',
          background: '#fff', borderRadius: 12, border: '1px dashed #E2E8F0'
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
          <div style={{ fontWeight: 600, color: '#64748b' }}>No notifications</div>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden'
        }}>
          {filtered.map((n, i) => {
            const { icon, color } = TYPE_ICONS[n.type] || TYPE_ICONS.General;
            return (
              <div key={n._id} style={{
                display: 'flex', gap: 14, padding: '16px 20px',
                borderTop: i > 0 ? '1px solid #EFF4FB' : 'none',
                background: !n.isRead ? '#FAFBFF' : '#fff',
                transition: 'background .15s'
              }}>
                {/* Unread dot */}
                <div style={{ paddingTop: 4, flexShrink: 0 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: !n.isRead ? '#3C50E0' : 'transparent',
                    marginTop: 2
                  }} />
                </div>

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `${color}15`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18
                }}>{icon}</div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontWeight: !n.isRead ? 700 : 600, fontSize: 14, color: '#1C2434' }}>
                      {n.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                        background: PRIORITY_BADGE[n.priority]?.bg,
                        color: PRIORITY_BADGE[n.priority]?.color
                      }}>{n.priority}</span>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 5, background: `${color}15`,
                      color, fontSize: 11, fontWeight: 600
                    }}>{n.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
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
  );
}
