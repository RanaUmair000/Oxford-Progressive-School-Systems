import React, { useEffect, useState } from 'react';
import { getTimetable } from '../../services/teacherApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SUBJECT_COLORS = [
  '#3C50E0', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#80CAEE',
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'
];

function getCurrentDay() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function TimetablePage() {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [colorMap, setColorMap] = useState({});

  useEffect(() => {
    const academicYear = localStorage.getItem('academicYear') || '';
    getTimetable(academicYear)
      .then(res => {
        const data = res.data.data.schedule;
        setSchedule(data);

        // Auto-assign colors to courses
        const map = {};
        let idx = 0;
        Object.values(data).flat().forEach(entry => {
          const cid = entry.courseId?._id;
          if (cid && !map[cid]) {
            map[cid] = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
            idx++;
          }
        });
        setColorMap(map);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load timetable'))
      .finally(() => setLoading(false));
  }, []);

  const today = getCurrentDay();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: '#64748b' }}>
      Loading timetable...
    </div>
  );

  if (error) return (
    <div style={{ padding: 24, color: '#EF4444', background: '#FEF2F2', borderRadius: 10, margin: 24 }}>{error}</div>
  );

  const dayEntries = schedule[selectedDay] || [];

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>My Timetable</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Weekly class schedule</p>
      </div>

      {/* Day Tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap'
      }}>
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, transition: 'all .15s',
              background: selectedDay === day ? '#3C50E0' : day === today ? '#EFF4FB' : '#F7F9FC',
              color: selectedDay === day ? '#fff' : day === today ? '#3C50E0' : '#64748b',
              outline: day === today && selectedDay !== day ? '2px solid #3C50E020' : 'none',
              position: 'relative'
            }}
          >
            {day}
            {day === today && (
              <span style={{
                position: 'absolute', top: -3, right: -3, width: 8, height: 8,
                background: '#10B981', borderRadius: '50%', border: '2px solid #fff'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Schedule for selected day */}
      {dayEntries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0', color: '#94a3b8',
          background: '#F7F9FC', borderRadius: 14, border: '1px dashed #E2E8F0'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏖️</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#64748b' }}>No classes on {selectedDay}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayEntries
            .sort((a, b) => (a.timeSlotId?.order || 0) - (b.timeSlotId?.order || 0))
            .map((entry, i) => {
              const color = colorMap[entry.courseId?._id] || '#3C50E0';
              const isBreak = entry.timeSlotId?.isBreak;

              if (isBreak) {
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', borderRadius: 8, background: '#F7F9FC',
                    border: '1px dashed #E2E8F0'
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: 12, minWidth: 90, textAlign: 'center' }}>
                      {formatTime(entry.timeSlotId?.startTime)} – {formatTime(entry.timeSlotId?.endTime)}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
                      ☕ {entry.timeSlotId?.label || 'Break'}
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'stretch', gap: 0,
                  borderRadius: 12, overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  background: '#fff'
                }}>
                  {/* Color bar */}
                  <div style={{ width: 5, background: color, flexShrink: 0 }} />

                  {/* Time */}
                  <div style={{
                    minWidth: 90, padding: '16px 14px',
                    borderRight: '1px solid #E2E8F0', display: 'flex',
                    flexDirection: 'column', justifyContent: 'center', gap: 2
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1C2434' }}>
                      {formatTime(entry.timeSlotId?.startTime)}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      {formatTime(entry.timeSlotId?.endTime)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1C2434', marginBottom: 4 }}>
                        {entry.courseId?.name || 'Unknown Course'}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {entry.courseId?.code && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 5, fontSize: 11,
                            background: `${color}15`, color, fontWeight: 600
                          }}>{entry.courseId.code}</span>
                        )}
                        <span style={{
                          padding: '2px 8px', borderRadius: 5, fontSize: 11,
                          background: '#EFF4FB', color: '#3C50E0', fontWeight: 500
                        }}>
                          {entry.classId?.name} {entry.classId?.section ? `· ${entry.classId.section}` : ''}
                        </span>
                      </div>
                    </div>
                    {entry.room && (
                      <div style={{
                        textAlign: 'right', color: '#64748b', fontSize: 12
                      }}>
                        <div style={{ fontSize: 18 }}>🚪</div>
                        <div>Room {entry.room}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {Object.entries(colorMap).map(([courseId, color]) => {
          const allEntries = Object.values(schedule).flat();
          const course = allEntries.find(e => e.courseId?._id === courseId)?.courseId;
          if (!course) return null;
          return (
            <div key={courseId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>{course.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
