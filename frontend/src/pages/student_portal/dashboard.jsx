import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import '../../css/student_style.css';

function AttendanceRing({ percentage = 0 }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  const color =
    percentage >= 75
      ? "var(--accent-green)"
      : percentage >= 60
      ? "var(--accent-warm)"
      : "var(--accent-red)";

  return (
    <div className="att-ring-wrap" style={{ width: 120, height: 120 }}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--bg-3)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="att-ring-label">
        <div className="att-ring-pct">{percentage}%</div>
        <div className="att-ring-sub">Attendance</div>
      </div>
    </div>
  );
}

export default function Dashboard({ navigate }) {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;


  // ── Student info ──────────────────────────────────────────────────────────
  // FIX: Use the logged-in user's _id instead of a hardcoded test ID
  const { data: studentData } = useFetch(
    user?._id ? `/api/students/${user._id}` : null,
    [user?._id]
  );
  const student = studentData?.data;

  // ── Fee stats ─────────────────────────────────────────────────────────────
  // FIX: Correct route is GET /api/fees/students/fee-status?studentId=...
  // The old route `/api/students/me/fees` does not exist.
  const { data: feeData } = useFetch(
    student?._id
      ? `/api/fees/students/fee-status?studentId=${student._id}`
      : null,
    [student?._id]
  );
  // The fee-status endpoint returns { data: { student, summary, invoices } }
  const feeSummary = feeData?.data?.summary;

  // ── Today's timetable ─────────────────────────────────────────────────────
  // FIX: Added /api prefix. Route is GET /api/timetable/today/class/:classId
  const academicYear =
    new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);

  const { data: ttData } = useFetch(
    student?.class
      ? `/api/timetable/today/class/${student.class}?academicYear=${academicYear}`
      : null,
    [student?.class]
  );
  const todaySchedule = ttData?.data?.schedule || [];
  const currentPeriod = ttData?.data?.currentPeriod;

  // ── Diary ─────────────────────────────────────────────────────────────────
  // FIX: Added /api prefix. Route is GET /api/diary/student/:studentId
  const { data: diaryData } = useFetch(
    student?._id ? `/api/diary/student/${student._id}?limit=3` : null,
    [student?._id]
  );
  
  const recentDiary = diaryData?.data || [];

  // ── Greeting ──────────────────────────────────────────────────────────────
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // ── Current period helper ─────────────────────────────────────────────────
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isCurrentPeriod = (entry) => {
    if (!entry?.timeSlotId) return false;
    const [sh, sm] = entry.timeSlotId.startTime?.split(":").map(Number) || [0, 0];
    const [eh, em] = entry.timeSlotId.endTime?.split(":").map(Number) || [0, 0];
    return currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em;
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      {/* Greeting */}
      <div className="page-header">
        <h1>
          {greeting()}, {user?.name?.split(" ")[0] || "Student"} 👋
        </h1>
        <p>Here's your academic overview for today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <span className="stat-label">Total Invoices</span>
          <span className="stat-value">{feeSummary?.totalInvoices ?? "—"}</span>
          <span className="stat-sub">Fee records</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <span className="stat-label">Pending Amount</span>
          <span className="stat-value" style={{ fontSize: "1.4rem" }}>
            {feeSummary
              ? `PKR ${(feeSummary.pendingAmount || 0).toLocaleString()}`
              : "—"}
          </span>
          <span className="stat-sub">Outstanding fees</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-label">Today's Classes</span>
          <span className="stat-value">
            {todaySchedule.filter((e) => !e.timeSlotId?.isBreak).length}
          </span>
          <span className="stat-sub">Periods scheduled</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📓</span>
          <span className="stat-label">Diary Entries</span>
          <span className="stat-value">
            {diaryData?.pagination?.total ?? "—"}
          </span>
          <span className="stat-sub">From teachers</span>
        </div>
      </div>

      <div className="content-grid">
        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-title">Today's Schedule</h2>
            <button
              className="btn btn-ghost text-sm"
              onClick={() => navigate("timetable")}
            >
              Full Timetable →
            </button>
          </div>
          <div className="schedule-list">
            {todaySchedule.length === 0 && (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--text-3)",
                }}
              >
                No classes scheduled today
              </div>
            )}
            {todaySchedule.map((entry, i) => {
              const isCurrent = isCurrentPeriod(entry);
              return (
                <div
                  key={i}
                  className={`schedule-item ${isCurrent ? "current" : ""}`}
                >
                  <span className="schedule-time">
                    {entry.timeSlotId?.startTime} – {entry.timeSlotId?.endTime}
                  </span>
                  <div className="schedule-dot"></div>
                  <div className="schedule-info">
                    {/* FIX: timetable entries use courseId (not subjectId) per the controller */}
                    <div className="schedule-course">
                      {entry.courseId?.name || "—"}
                    </div>
                    <div className="schedule-room">
                      {entry.teacherId
                        ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}`
                        : ""}
                      {entry.room ? ` · Room ${entry.room}` : ""}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="badge badge-green">Now</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Fee summary */}
          <div className="card">
            <div className="card-title">Fee Summary</div>
            {feeSummary ? (
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {[
                  [
                    "Total Billed",
                    `PKR ${feeSummary.totalAmount?.toLocaleString() || 0}`,
                  ],
                  [
                    "Paid",
                    `PKR ${feeSummary.paidAmount?.toLocaleString() || 0}`,
                  ],
                  [
                    "Pending",
                    `PKR ${feeSummary.pendingAmount?.toLocaleString() || 0}`,
                  ],
                  [
                    "Overdue",
                    `${feeSummary.overdueInvoices || 0} invoice(s)`,
                  ],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                    style={{
                      padding: ".4rem 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span className="text-xs">{label}</span>
                    <span style={{ fontSize: ".85rem", fontWeight: 500 }}>
                      {val}
                    </span>
                  </div>
                ))}
                <button
                  className="btn btn-ghost text-sm"
                  style={{ marginTop: ".5rem", width: "100%" }}
                  onClick={() => navigate("fees")}
                >
                  View All Invoices →
                </button>
              </div>
            ) : (
              <div className="text-xs" style={{ padding: "1rem 0" }}>
                Loading…
              </div>
            )}
          </div>

          {/* Recent diary */}
          <div className="card">
            <div className="card-title">Recent Updates</div>
            {recentDiary.length === 0 && (
              <div
                className="text-xs"
                style={{ color: "var(--text-3)", padding: ".5rem 0" }}
              >
                No entries yet
              </div>
            )}
            {recentDiary.map((entry, i) => (
              <div
                key={i}
                style={{
                  padding: ".6rem 0",
                  borderBottom:
                    i < recentDiary.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                    marginBottom: ".25rem",
                  }}
                >
                  <span
                    className={`badge ${
                      entry.type === "diary" ? "badge-blue" : "badge-purple"
                    }`}
                  >
                    {entry.type}
                  </span>
                  <span className="text-xs">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: ".875rem", fontWeight: 500 }}>
                  {entry.title}
                </div>
                <div className="text-xs" style={{ marginTop: ".2rem" }}>
                  {entry.teacherId
                    ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}`
                    : ""}
                </div>
              </div>
            ))}
            <button
              className="btn btn-ghost text-sm"
              style={{ marginTop: ".75rem", width: "100%" }}
              onClick={() => navigate("diary")}
            >
              View All →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}