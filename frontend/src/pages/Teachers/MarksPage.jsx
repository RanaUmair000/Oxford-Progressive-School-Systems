import React, { useEffect, useState } from 'react';
import { getAssignedClasses, getMarksByClass, enterMarks } from '../../services/teacherApi';
import { getStudentsForAttendance } from '../../services/teacherApi';

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 7,
  border: '1px solid #E2E8F0', fontSize: 13, color: '#1C2434',
  background: '#F7F9FC', outline: 'none', boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8',
  marginBottom: 5, letterSpacing: '.5px', textTransform: 'uppercase'
};

const EXAM_TYPES = ['Quiz', 'Midterm', 'Final', 'Assignment', 'Practical', 'Other'];

const gradeColor = {
  'A+': '#10B981', 'A': '#10B981', 'B+': '#3C50E0', 'B': '#3C50E0',
  'C+': '#F59E0B', 'C': '#F59E0B', 'D': '#EF4444', 'F': '#EF4444'
};

function autoGrade(obtained, total) {
  if (!obtained || !total) return '';
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 75) return 'B+';
  if (pct >= 65) return 'B';
  if (pct >= 55) return 'C+';
  if (pct >= 45) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

export default function MarksPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState('Other');
  const [examDate, setExamDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getAssignedClasses().then(res => setClasses(res.data.data));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    getStudentsForAttendance(selectedClass, examDate)
      .then(res => {
        const s = res.data.data.students;
        console.log(res);
        setStudents(s);
        const init = {};
        s.forEach(st => { init[st._id] = { obtained: '', remarks: '' }; });
        setMarks(init);
      })
      .finally(() => setLoading(false));
  }, [selectedClass]);

  useEffect(() => {
  if (!selectedClass || !selectedCourse || !examTitle || !examDate) return;

  const fetchExistingMarks = async () => {
    try {
      const res = await getMarksByClass(selectedClass, {
        courseId: selectedCourse,
        examTitle,
        examDate,
        academicYear: localStorage.getItem('academicYear') || ''
      });

      const existingMarks = res.data.data;

      if (existingMarks.length > 0) {
        // ✅ Marks already exist → populate form
        const updated = {};
        existingMarks.forEach(m => {
          updated[m.studentId._id] = {
            obtained: m.marksObtained,
            remarks: m.remarks || '',
          };
        });

        setMarks(updated);
        setTotalMarks(existingMarks[0].totalMarks);

        showToast('Existing marks loaded', 'success');
      } else {
        // ❌ No marks → reset empty
        const empty = {};
        students.forEach(st => {
          empty[st._id] = { obtained: '', remarks: '' };
        });
        setMarks(empty);
      }

    } catch (err) {
      console.error(err);
    }
  };

  fetchExistingMarks();

}, [selectedClass, selectedCourse, examTitle, examDate]);

  const coursesForClass = selectedClass
    ? (classes.find(c => c.classId === selectedClass)?.courses || [])
    : [];

  const setMark = (studentId, field, value) => {
    setMarks(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examTitle.trim()) return showToast('Enter exam title', 'error');
    if (!selectedCourse) return showToast('Select a course', 'error');

    const marksArr = students.map(s => ({
      studentId: s._id,
      marksObtained: Number(marks[s._id]?.obtained || 0),
      totalMarks: Number(totalMarks),
      remarks: marks[s._id]?.remarks || ''
    }));

    setSubmitting(true);
    try {
      await enterMarks({
        classId: selectedClass,
        courseId: selectedCourse,
        examTitle,
        examType,
        examDate: examDate || undefined,
        totalMarks: Number(totalMarks),
        academicYear: localStorage.getItem('academicYear') || '',
        marks: marksArr
      });
      showToast('Marks saved successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save marks', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalFilled = Object.values(marks).filter(m => m.obtained !== '').length;
  const avgMarks = totalFilled > 0
    ? (Object.values(marks).reduce((sum, m) => sum + (Number(m.obtained) || 0), 0) / totalFilled).toFixed(1)
    : 0;

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
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1C2434', margin: 0 }}>Marks Entry</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Enter exam and assessment marks</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Controls */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
          padding: 20, marginBottom: 20
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Exam Date</label>
              <input type="date" style={inputStyle} value={examDate}
                onChange={e => setExamDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Class *</label>
              <select required style={inputStyle} value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSelectedCourse(''); }}>
                <option value="">Select class</option>
                {classes.map(c => (
                  <option key={c.classId} value={c.classId}>
                    {c.className} {c.section ? `(${c.section})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Course *</label>
              <select required style={inputStyle} value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Select course</option>
                {coursesForClass.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Exam Title *</label>
              <input required style={inputStyle} value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                placeholder="e.g., Mid Term 1" />
            </div>
            <div>
              <label style={labelStyle}>Exam Type</label>
              <select style={inputStyle} value={examType} onChange={e => setExamType(e.target.value)}>
                {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Total Marks</label>
              <input type="number" style={inputStyle} value={totalMarks} min={1}
                onChange={e => setTotalMarks(e.target.value)} />
            </div>
            
          </div>
        </div>

        {/* Stats bar */}
        {students.length > 0 && (
          <div style={{
            display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap'
          }}>
            {[
              { label: 'Students', val: students.length, color: '#3C50E0' },
              { label: 'Filled', val: `${totalFilled}/${students.length}`, color: '#10B981' },
              { label: 'Class Avg', val: `${avgMarks}/${totalMarks}`, color: '#F59E0B' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '8px 16px', borderRadius: 8, background: '#fff',
                border: '1px solid #E2E8F0', fontSize: 13
              }}>
                <span style={{ color: '#94a3b8' }}>{stat.label}: </span>
                <span style={{ fontWeight: 700, color: stat.color }}>{stat.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Marks Table */}
        {selectedClass && (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px 160px',
              padding: '10px 20px', background: '#F7F9FC',
              fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '.5px', textTransform: 'uppercase'
            }}>
              <div>ROLL</div><div>STUDENT</div><div>MARKS OBTAINED</div><div>GRADE</div><div>REMARKS</div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading students...</div>
            ) : students.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No students found</div>
            ) : (
              students.map((student, i) => {
                const obtained = marks[student._id]?.obtained;
                const grade = obtained !== '' ? autoGrade(Number(obtained), Number(totalMarks)) : '';
                const pct = obtained !== '' ? Math.round((Number(obtained) / Number(totalMarks)) * 100) : null;
                const isOver = obtained !== '' && Number(obtained) > Number(totalMarks);

                return (
                  <div key={student._id} style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px 160px',
                    padding: '12px 20px', alignItems: 'center',
                    borderTop: '1px solid #EFF4FB',
                    background: i % 2 === 0 ? '#fff' : '#FAFBFC'
                  }}>
                    <div style={{ fontWeight: 600, color: '#3C50E0', fontSize: 13 }}>{student.rollNumber}</div>
                    <div style={{ fontWeight: 500, color: '#1C2434', fontSize: 14 }}>
                      {student.firstName} {student.lastName}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number"
                          min={0}
                          max={totalMarks}
                          value={marks[student._id]?.obtained || ''}
                          onChange={e => setMark(student._id, 'obtained', e.target.value)}
                          placeholder="0"
                          style={{
                            ...inputStyle,
                            width: 80,
                            border: isOver ? '1px solid #EF4444' : '1px solid #E2E8F0'
                          }}
                        />
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>/ {totalMarks}</span>
                        {pct !== null && (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{pct}%</span>
                        )}
                      </div>
                      {isOver && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 3 }}>Exceeds total</div>}
                    </div>
                    <div>
                      {grade && (
                        <span style={{
                          padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 13,
                          background: `${gradeColor[grade]}18`,
                          color: gradeColor[grade]
                        }}>{grade}</span>
                      )}
                    </div>
                    <div>
                      <input
                        style={{ ...inputStyle, width: '100%' }}
                        value={marks[student._id]?.remarks || ''}
                        onChange={e => setMark(student._id, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                      />
                    </div>
                  </div>
                );
              })
            )}

            {students.length > 0 && (
              <div style={{
                padding: '14px 20px', borderTop: '1px solid #E2E8F0',
                display: 'flex', justifyContent: 'flex-end', gap: 10
              }}>
                <button type="submit" disabled={submitting} style={{
                  padding: '10px 28px', borderRadius: 8, border: 'none',
                  background: submitting ? '#94a3b8' : '#3C50E0',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                  {submitting ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
