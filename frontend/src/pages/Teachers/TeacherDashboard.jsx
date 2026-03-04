import React, { useEffect, useState } from 'react';
import { getDashboard } from '../../services/teacherApi';

const statusColors = {
  Present: '#10B981',
  Absent: '#EF4444',
  Late: '#F59E0B',
  Leave: '#6366F1',
};

const cardStyle = {
  background: '#fff',
  borderRadius: 14,
  padding: '24px 28px',
  boxShadow: '0 1px 4px rgba(60,80,224,0.07)',
  border: '1px solid #E2E8F0',
  flex: 1,
  minWidth: 180,
};

const StatCard = ({ icon, label, value, accent }) => (
  <div style={{ ...cardStyle, borderTop: `3px solid ${accent}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${accent}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20
      }}>{icon}</div>
      <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: '#1C2434' }}>{value ?? '—'}</div>
  </div>
);

const ScheduleCard = ({ entry }) => {
  const slot = entry.timeSlotId;
  const course = entry.courseId;
  const cls = entry.classId;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 16px', background: '#F7F9FC',
      borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 8
    }}>
      <div style={{
        minWidth: 68, textAlign: 'center', padding: '6px 10px',
        background: '#3C50E0', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 600
      }}>
        {slot?.startTime}<br />{slot?.endTime}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#1C2434', fontSize: 14 }}>{course?.name || 'Unknown'}</div>
        <div style={{ color: '#64748b', fontSize: 12 }}>{cls?.name || ''} {cls?.section ? `· ${cls.section}` : ''}</div>
      </div>
      {entry.room && (
        <div style={{
          padding: '4px 10px', borderRadius: 6,
          background: '#EFF4FB', color: '#3C50E0', fontSize: 12, fontWeight: 500
        }}>Room {entry.room}</div>
      )}
    </div>
  );
};

const NotificationItem = ({ n }) => {
  const colors = { Announcement: '#3C50E0', Assignment: '#F59E0B', Exam: '#EF4444', General: '#10B981', Alert: '#EF4444', Leave: '#6366F1' };
  const color = colors[n.type] || '#64748b';
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '10px 0',
      borderBottom: '1px solid #EFF4FB'
    }}>
      <div style={{
        minWidth: 36, height: 36, borderRadius: '50%',
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 14, color
      }}>
        {n.type === 'Announcement' ? '📢' : n.type === 'Assignment' ? '📝' : n.type === 'Exam' ? '📋' : '🔔'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1C2434' }}>{n.title}</div>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{n.message}</div>
        <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3 }}>
          {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const academicYear = localStorage.getItem('academicYear') || '';
    getDashboard(academicYear)
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div>Loading dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 24, color: '#EF4444', background: '#FEF2F2', borderRadius: 10, margin: 24 }}>{error}</div>
  );

  const { stats, todaySchedule, recentNotifications } = data || {};

  return (
    <div style={{ padding: '24px', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>Teacher Dashboard</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard icon="🏫" label="Total Classes" value={stats?.totalClasses} accent="#3C50E0" />
        <StatCard icon="📅" label="Today's Classes" value={stats?.todayClassesCount} accent="#10B981" />
        <StatCard icon="👨‍🎓" label="Total Students" value={stats?.totalStudents} accent="#80CAEE" />
        <StatCard icon="📝" label="Pending Assignments" value={stats?.pendingAssignments} accent="#F59E0B" />
        <StatCard icon="🔔" label="Unread Alerts" value={stats?.unreadNotifications} accent="#EF4444" />
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* Today's Schedule */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C2434', margin: 0 }}>Today's Schedule</h2>
            <span style={{
              padding: '3px 10px', borderRadius: 20, background: '#EFF4FB',
              color: '#3C50E0', fontSize: 12, fontWeight: 600
            }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
          {todaySchedule?.length > 0
            ? todaySchedule.map((e, i) => <ScheduleCard key={i} entry={e} />)
            : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <div>No classes scheduled today</div>
              </div>
            )
          }
        </div>

        {/* Notifications */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C2434', margin: 0 }}>Recent Alerts</h2>
            {stats?.unreadNotifications > 0 && (
              <span style={{
                background: '#EF4444', color: '#fff', borderRadius: 20,
                padding: '2px 8px', fontSize: 11, fontWeight: 700
              }}>{stats.unreadNotifications} new</span>
            )}
          </div>
          {recentNotifications?.length > 0
            ? recentNotifications.map((n) => <NotificationItem key={n._id} n={n} />)
            : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <div>All caught up!</div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
