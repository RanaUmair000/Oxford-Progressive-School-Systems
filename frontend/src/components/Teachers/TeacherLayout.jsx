import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/teacher/dashboard',      label: 'Dashboard',     icon: '🏠' },
  { path: '/teacher/timetable',      label: 'Timetable',     icon: '📅' },
  { path: '/teacher/attendance',     label: 'Attendance',    icon: '✅' },
  { path: '/teacher/assignments',    label: 'Assignments',   icon: '📝' },
  { path: '/teacher/marks',          label: 'Marks Entry',   icon: '📊' },
  { path: '/teacher/leave',          label: 'Leave',         icon: '🏖️' },
  { path: '/teacher/notifications',  label: 'Notifications', icon: '🔔' },
  { path: '/teacher/profile',        label: 'Profile',       icon: '👤' },
];

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#EFF4FB', fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 240, flexShrink: 0, background: '#1C2434',
        transition: 'width .25s', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid #2E3A47',
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 16 }}>Teacher</div>
              <div style={{ color: '#80CAEE', fontSize: 12 }}>Portal</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: 28, height: 28, borderRadius: 6, border: 'none',
            background: '#2E3A47', color: '#80CAEE', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: 12, padding: collapsed ? '12px 0' : '11px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration: 'none', margin: '2px 8px', borderRadius: 8,
                background: isActive ? '#3C50E0' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? 600 : 400, fontSize: 14,
                transition: 'all .15s'
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: collapsed ? '16px 0' : '16px 20px',
          borderTop: '1px solid #2E3A47',
          color: '#64748b', fontSize: 12, textAlign: collapsed ? 'center' : 'left'
        }}>
          {collapsed ? '🏫' : '🏫 School MS v2.0'}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
