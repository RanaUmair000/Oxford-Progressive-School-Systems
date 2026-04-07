import { useState, useEffect } from 'react';
import { useFetch } from "../../hooks/useFetch";

const TYPE_COLORS = {
  Core:     { bg: "rgba(108,143,255,.1)", color: "var(--accent)" },
  Elective: { bg: "rgba(167,139,250,.1)", color: "var(--accent-2)" },
  Lab:      { bg: "rgba(74,222,128,.1)",  color: "var(--accent-green)" },
  Optional: { bg: "rgba(245,158,107,.1)", color: "var(--accent-warm)" },
};

export default function Courses() {
  // ✅ useState inside the component, not at module level
  const [classId, setClassId] = useState(null);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');

  // ✅ useEffect inside the component, component is NOT async
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!user?._id) return;

        const res = await fetch(
          `http://localhost:5000/api/students/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        setClassId(data.data?.class ?? null);

      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };

    fetchStudent();
  }, [user?._id]);

  // Get class info (with courseIds populated)
  const { data: classData, loading } = useFetch(
    classId ? `/api/classes/${classId}` : null,
    [classId]
  );
  const courses = classData?.courseIds || [];

  // Academic year timetable to get teacher per course
  const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const { data: ttData } = useFetch(
    classId ? `/api/timetable/class/${classId}?academicYear=${academicYear}` : null,
    [classId]
  );
  const ttEntries = ttData?.data?.raw || [];

  // Build teacher map per course
  const teacherMap = {};
  ttEntries.forEach(e => {
    const cid = e.courseId?._id?.toString();
    if (cid && !teacherMap[cid] && e.teacherId) {
      teacherMap[cid] = `${e.teacherId.firstName} ${e.teacherId.lastName}`;
    }
  });

  // Weekly hours per course
  const hoursMap = {};
  ttEntries.forEach(e => {
    const cid = e.courseId?._id?.toString();
    if (cid) hoursMap[cid] = (hoursMap[cid] || 0) + 1;
  });

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "1rem" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 160, borderRadius: "var(--radius)" }} />
      ))}
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div className="page-header">
        <h1>My Courses</h1>
        <p>
          {classData?.name ? `${classData.name}` : ""}
          {courses.length > 0 ? ` · ${courses.length} courses enrolled` : ""}
        </p>
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No courses found</h3>
          <p>Your class may not have courses assigned yet.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {courses.map((course, i) => {
          const typeDef = TYPE_COLORS[course.type] || TYPE_COLORS.Core;
          const tid = course._id?.toString();
          const teacher = teacherMap[tid];
          const hours = hoursMap[tid] || course.weeklyHours || 0;

          return (
            <div
              key={course._id || i}
              className="card"
              style={{ animation: `fadeUp .4s ease ${i * 0.05}s both`, transition: "var(--transition)", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}
            >
              {/* Top badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".75rem" }}>
                <span style={{ ...typeDef, padding: ".2rem .65rem", borderRadius: "100px", fontSize: ".7rem", fontWeight: 600 }}>
                  {course.type || "Core"}
                </span>
                <span style={{ fontSize: ".72rem", color: "var(--text-3)", fontFamily: "monospace" }}>
                  {course.code || "—"}
                </span>
              </div>

              {/* Course name */}
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 400, marginBottom: ".5rem", lineHeight: 1.3 }}>
                {course.name}
              </div>

              {/* Description */}
              {course.description && (
                <div style={{
                  fontSize: ".8rem", color: "var(--text-2)", marginBottom: ".75rem", lineHeight: 1.6,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>
                  {course.description}
                </div>
              )}

              <div style={{ height: 1, background: "var(--border)", margin: ".75rem 0" }} />

              {/* Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                {teacher && (
                  <div style={{ display: "flex", gap: ".5rem", fontSize: ".78rem", color: "var(--text-2)" }}>
                    <span>👨‍🏫</span><span>{teacher}</span>
                  </div>
                )}
                {hours > 0 && (
                  <div style={{ display: "flex", gap: ".5rem", fontSize: ".78rem", color: "var(--text-2)" }}>
                    <span>⏱</span><span>{hours} period(s) / week</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: ".5rem", fontSize: ".78rem", alignItems: "center" }}>
                  <span>●</span>
                  <span style={{ color: course.status === "Active" ? "var(--accent-green)" : "var(--text-3)" }}>
                    {course.status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}