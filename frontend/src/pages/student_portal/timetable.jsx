import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };

const COLORS = [
  "rgba(108,143,255,.12)", "rgba(167,139,250,.12)", "rgba(74,222,128,.12)",
  "rgba(245,158,107,.12)", "rgba(248,113,113,.12)", "rgba(56,189,248,.12)",
];
const BORDER_COLORS = [
  "var(--accent)", "var(--accent-2)", "var(--accent-green)",
  "var(--accent-warm)", "var(--accent-red)", "#38bdf8",
];

export default function Timetable() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem('token');

  const [view, setView] = useState("week");
  const [classId, setClassId] = useState(null);                        // ✅ fetched via API
  const [academicYear, setAcademicYear] = useState(
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  );

  // ✅ Fetch student record to get classId (same pattern as courses.jsx)
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!user?._id) return;
        const res = await fetch(`http://localhost:5000/api/students/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClassId(data.data?.class ?? null);
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };
    fetchStudent();
  }, [user?._id]);

  const { data: weekData, loading } = useFetch(
    classId ? `/api/timetable/class/${classId}?academicYear=${academicYear}` : null,
    [classId, academicYear]
  );
  const { data: todayData } = useFetch(
    classId ? `/api/timetable/today/class/${classId}?academicYear=${academicYear}` : null,
    [classId, academicYear]
  );

  const schedule       = weekData?.data?.schedule  || {};
  const todaySchedule  = todayData?.data?.schedule || [];
  const currentPeriod  = todayData?.data?.currentPeriod;
  const nextPeriod     = todayData?.data?.nextPeriod;

  // Collect all unique time slots sorted by order
  const allSlots = [];
  DAYS.forEach(day => {
    (schedule[day] || []).forEach(entry => {
      if (entry.timeSlotId) {
        const key = entry.timeSlotId._id?.toString();
        if (!allSlots.find(s => s.id === key)) {
          allSlots.push({ id: key, ...entry.timeSlotId });
        }
      }
    });
  });
  allSlots.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Course → color index map
  const courseColorMap = {};
  let colorIdx = 0;
  DAYS.forEach(day => {
    (schedule[day] || []).forEach(entry => {
      const cid = entry.courseId?._id?.toString();
      if (cid && !courseColorMap[cid]) {
        courseColorMap[cid] = colorIdx++ % COLORS.length;
      }
    });
  });

  const now            = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayName      = DAYS[new Date().getDay() - 1] || "";

  const isCurrentSlot = (slot) => {
    if (!slot) return false;
    const [sh, sm] = slot.startTime?.split(":").map(Number) || [0, 0];
    const [eh, em] = slot.endTime?.split(":").map(Number)   || [0, 0];
    return currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em;
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div className="page-header">
        <h1>Timetable</h1>
        <p>Your weekly class schedule and today's periods.</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-3" style={{ flexWrap: "wrap", gap: ".75rem" }}>
        <div className="tabs" style={{ margin: 0, border: "none" }}>
          {[["week", "Weekly View"], ["today", "Today"]].map(([v, l]) => (
            <button key={v} className={`tab ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
        <div className="field" style={{ margin: 0 }}>
          <select
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-1)", borderRadius: "var(--radius-sm)", padding: ".5rem .9rem", fontSize: ".875rem" }}
          >
            {[0, 1, -1].map(offset => {
              const y   = new Date().getFullYear() + offset;
              const val = `${y}-${y + 1}`;
              return <option key={val} value={val}>{val}</option>;
            })}
          </select>
        </div>
      </div>

      {/* ── Today view ────────────────────────────────────────────── */}
      {view === "today" && (
        <div>
          {(currentPeriod || nextPeriod) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              {currentPeriod && (
                <div className="card" style={{ background: "rgba(108,143,255,.06)", borderColor: "var(--accent)" }}>
                  <div className="card-title" style={{ color: "var(--accent)" }}>● Now in class</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem" }}>{currentPeriod.courseId?.name || "—"}</div>
                  <div className="text-xs" style={{ marginTop: ".5rem" }}>
                    {currentPeriod.timeSlotId?.startTime} – {currentPeriod.timeSlotId?.endTime}
                    {currentPeriod.room ? ` · Room ${currentPeriod.room}` : ""}
                  </div>
                  {currentPeriod.teacherId && (
                    <div className="text-xs">👨‍🏫 {currentPeriod.teacherId.firstName} {currentPeriod.teacherId.lastName}</div>
                  )}
                </div>
              )}
              {nextPeriod && (
                <div className="card">
                  <div className="card-title">Next period</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem" }}>{nextPeriod.courseId?.name || "—"}</div>
                  <div className="text-xs" style={{ marginTop: ".5rem" }}>
                    {nextPeriod.timeSlotId?.startTime} – {nextPeriod.timeSlotId?.endTime}
                    {nextPeriod.room ? ` · Room ${nextPeriod.room}` : ""}
                  </div>
                </div>
              )}
            </div>
          )}

          <h2 className="section-title">
            Full Schedule — {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </h2>

          <div className="schedule-list">
            {todaySchedule.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3>No classes today</h3>
              </div>
            )}
            {todaySchedule.map((entry, i) => {
              const isCurrent = isCurrentSlot(entry.timeSlotId);
              const cid = entry.courseId?._id?.toString();
              const ci  = courseColorMap[cid] ?? 0;
              return (
                <div
                  key={i}
                  className={`schedule-item ${isCurrent ? "current" : ""}`}
                  style={{ borderLeftColor: BORDER_COLORS[ci], borderLeftWidth: 3 }}
                >
                  <span className="schedule-time">{entry.timeSlotId?.startTime} – {entry.timeSlotId?.endTime}</span>
                  <div className="schedule-dot" style={{ background: BORDER_COLORS[ci] }}></div>
                  <div className="schedule-info">
                    <div className="schedule-course">{entry.courseId?.name || entry.subjectId?.name || "—"}</div>
                    <div className="schedule-room">
                      {entry.teacherId ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}` : ""}
                      {entry.room ? ` · Room ${entry.room}` : ""}
                    </div>
                  </div>
                  {entry.timeSlotId?.isBreak && <span className="badge badge-gray">Break</span>}
                  {isCurrent && <span className="badge badge-green">Now</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Weekly grid view ──────────────────────────────────────── */}
      {view === "week" && (
        <div>
          {loading ? (
            <div className="skeleton" style={{ height: 400, borderRadius: "var(--radius)" }}></div>
          ) : allSlots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📆</div>
              <h3>No timetable found</h3>
              <p>No timetable has been set for {academicYear}.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div className="timetable-grid" style={{ gridTemplateColumns: `120px repeat(${DAYS.length}, 1fr)` }}>

                {/* Header row */}
                <div className="timetable-cell header"></div>
                {DAYS.map(day => (
                  <div
                    key={day}
                    className={`timetable-cell header ${day === todayName ? "has-class" : ""}`}
                    style={{ color: day === todayName ? "var(--accent)" : undefined }}
                  >
                    {DAY_SHORT[day]} {day === todayName && "·"}
                  </div>
                ))}

                {/* Slot rows */}
                {allSlots.map(slot => {
                  const isCurrent = isCurrentSlot(slot);
                  return (
                    <div key={slot.id} style={{ display: "contents" }}>
                      {/* Time label */}
                      <div
                        className="timetable-cell"
                        style={{
                          display: "flex", flexDirection: "column", justifyContent: "center",
                          background: isCurrent ? "rgba(108,143,255,.08)" : "var(--bg-3)",
                        }}
                      >
                        <div style={{ fontSize: ".72rem", color: isCurrent ? "var(--accent)" : "var(--text-3)", fontWeight: 600 }}>
                          {slot.startTime}
                        </div>
                        <div style={{ fontSize: ".65rem", color: "var(--text-3)" }}>{slot.endTime}</div>
                        {slot.label && (
                          <div style={{ fontSize: ".6rem", color: "var(--text-3)", marginTop: ".2rem" }}>{slot.label}</div>
                        )}
                      </div>

                      {/* Day cells */}
                      {DAYS.map(day => {
                        const entry   = (schedule[day] || []).find(e => e.timeSlotId?._id?.toString() === slot.id);
                        const isToday = day === todayName;
                        const cid     = entry?.courseId?._id?.toString();
                        const ci      = cid ? (courseColorMap[cid] ?? 0) : -1;

                        return (
                          <div
                            key={day}
                            className={`timetable-cell ${entry ? "has-class" : ""}`}
                            style={{
                              background:  entry && ci >= 0 ? COLORS[ci] : isCurrent && isToday ? "rgba(108,143,255,.04)" : undefined,
                              borderLeft:  isToday ? "2px solid rgba(108,143,255,.3)" : undefined,
                            }}
                          >
                            {entry && !entry.timeSlotId?.isBreak && (
                              <div>
                                <div className="cell-course">{entry.courseId?.name || "—"}</div>
                                {entry.teacherId && (
                                  <div className="cell-teacher">
                                    {entry.teacherId.firstName} {entry.teacherId.lastName}
                                  </div>
                                )}
                                {entry.room && <div className="cell-room">Room {entry.room}</div>}
                              </div>
                            )}
                            {entry?.timeSlotId?.isBreak && (
                              <div style={{ color: "var(--text-3)", fontSize: ".72rem", fontStyle: "italic" }}>Break</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}