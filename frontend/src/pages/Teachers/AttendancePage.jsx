import React, { useEffect, useState, useCallback } from 'react';
import { getAssignedClasses, getStudentsForAttendance, markAttendance } from '../../services/teacherApi';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late', 'Leave'];
const STATUS_STYLES = {
  Present: { bg: '#D1FAE5', color: '#10B981', border: '#10B981' },
  Absent:  { bg: '#FEE2E2', color: '#EF4444', border: '#EF4444' },
  Late:    { bg: '#FEF3C7', color: '#F59E0B', border: '#F59E0B' },
  Leave:   { bg: '#EDE9FE', color: '#6366F1', border: '#6366F1' },
};

function formatDate(d) {
  return new Date(d).toISOString().split('T')[0];
}

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load assigned classes
  useEffect(() => {
    getAssignedClasses()
      .then(res => setClasses(res.data.data))
      .catch(() => showToast('Failed to load classes', 'error'));
  }, []);

  // Load students when class/date changes
  const loadStudents = useCallback(() => {
    if (!selectedClass) return;
    setLoading(true);
    getStudentsForAttendance(selectedClass, date)
      .then(res => {
        const { students: s, isAlreadyMarked: marked } = res.data.data;
        setStudents(s);
        setIsAlreadyMarked(marked);
        console.log(res);

        // Initialize attendance state
        const init = {};
        s.forEach(student => {
          init[student._id] = student.attendance?.status || 'Present';
        });
        setAttendance(init);
      })
      .catch(() => showToast('Failed to load students', 'error'))
      .finally(() => setLoading(false));
  }, [selectedClass, date]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const setAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedClass) return showToast('Select a class first', 'error');

    setSubmitting(true);
    try {
      const attendanceArr = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || 'Present',
        remarks: ''
      }));

      await markAttendance({ classId: selectedClass, date, attendance: attendanceArr });
      showToast('Attendance saved successfully!');
      setIsAlreadyMarked(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const role = localStorage.getItem('role');

  const filteredStudents = students.filter(s =>
    !filter || `${s.firstName} ${s.lastName} ${s.rollNumber}`.toLowerCase().includes(filter.toLowerCase())
  );

  const statusCount = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(attendance).filter(v => v === s).length;
    return acc;
  }, {});

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: toast.type === 'error' ? '#EF4444' : '#10B981',
          fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          border: `1px solid ${toast.type === 'error' ? '#EF4444' : '#10B981'}30`
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>Attendance</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Mark and view student attendance</p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20,
        padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0'
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>CLASS</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              border: '1px solid #E2E8F0', fontSize: 14, color: '#1C2434',
              background: '#F7F9FC', outline: 'none'
            }}
          >
            <option value="">Select a class...</option>
            {classes.map(c => (
              <option key={c.classId} value={c.classId}>
                {c.className} {c.section ? `(${c.section})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>DATE</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
              fontSize: 14, color: '#1C2434', background: '#F7F9FC', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Status Summary */}
      {students.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => (
            <div key={s} style={{
              padding: '6px 14px', borderRadius: 20,
              background: STATUS_STYLES[s].bg,
              color: STATUS_STYLES[s].color,
              fontSize: 13, fontWeight: 600
            }}>
              {s}: {statusCount[s] || 0}
            </div>
          ))}
        </div>
      )}

      {/* Already marked badge */}
      {isAlreadyMarked && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20, background: '#D1FAE5',
          color: '#10B981', fontSize: 13, fontWeight: 600, marginBottom: 16
        }}>
          ✅ Attendance already marked for this date
        </div>
      )}

      {/* Student Table */}
      {selectedClass && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
          }}>
            <div style={{ fontWeight: 700, color: '#1C2434', fontSize: 15 }}>
              {loading ? 'Loading...' : `${filteredStudents.length} Students`}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="Search students..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
                  fontSize: 13, outline: 'none', width: 180
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: 12 }}>Mark all:</span>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => setAll(s)} style={{
                  padding: '5px 10px', borderRadius: 6, border: `1px solid ${STATUS_STYLES[s].border}`,
                  background: STATUS_STYLES[s].bg, color: STATUS_STYLES[s].color,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>{s}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              {students.length === 0 ? 'No students found for this class' : 'No results match your search'}
            </div>
          ) : (
            <div>
              {/* Column Headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 140px',
                padding: '10px 20px', background: '#F7F9FC',
                fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '.5px', textTransform: 'uppercase'
              }}>
                <div>ROLL</div>
                <div>STUDENT</div>
                <div>STATUS</div>
              </div>

              {filteredStudents.map((student, i) => (
                <div key={student._id} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr 140px',
                  padding: '12px 20px', alignItems: 'center',
                  borderTop: '1px solid #EFF4FB',
                  background: i % 2 === 0 ? '#fff' : '#FAFBFC'
                }}>
                  <div style={{ fontWeight: 600, color: '#3C50E0', fontSize: 13 }}>{student.rollNumber}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: '#EFF4FB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#3C50E0', fontSize: 12, flexShrink: 0
                    }}>
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1C2434' }}>
                        {student.firstName} {student.lastName}
                      </div>
                      {student.section && (
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>Section {student.section}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setAttendance(prev => ({ ...prev, [student._id]: s }))}
                        title={s}
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none',
                          cursor: 'pointer', fontSize: 14,
                          background: attendance[student._id] === s ? STATUS_STYLES[s].bg : '#EFF4FB',
                          color: attendance[student._id] === s ? STATUS_STYLES[s].color : '#94a3b8',
                          outline: attendance[student._id] === s ? `2px solid ${STATUS_STYLES[s].border}40` : 'none',
                          transition: 'all .12s'
                        }}
                      >
                        {s === 'Present' ? '✓' : s === 'Absent' ? '✗' : s === 'Late' ? '⏰' : '📋'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          {students.length > 0 && (
            <div style={{
              padding: '14px 20px', borderTop: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '10px 28px', borderRadius: 8, border: 'none',
                  background: submitting ? '#94a3b8' : '#3C50E0',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background .15s'
                }}
              >
                {submitting ? 'Saving...' : isAlreadyMarked ? 'Update Attendance' : 'Submit Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
