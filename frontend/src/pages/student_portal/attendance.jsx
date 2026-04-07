import { useState, useEffect, useMemo } from "react";
import { useFetch } from "../../hooks/useFetch";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STATUS_CONFIG = {
    Present: { color: "var(--accent-green)", bg: "rgba(74,222,128,.12)", icon: "✓" },
    Absent:  { color: "var(--accent-red)",   bg: "rgba(248,113,113,.12)", icon: "✗" },
    Late:    { color: "var(--accent-warm)",  bg: "rgba(245,158,107,.12)", icon: "◷" },
    Leave:   { color: "var(--accent-2)",     bg: "rgba(167,139,250,.12)", icon: "⟳" },
    Holiday: { color: "var(--text-3)",       bg: "rgba(255,255,255,.05)", icon: "◆" },
};

// ── Radial ring ───────────────────────────────────────────────────────────────
function RingChart({ percentage, size = 140, stroke = 10 }) {
    const r      = (size - stroke) / 2;
    const c      = 2 * Math.PI * r;
    const pct    = Math.min(Math.max(parseFloat(percentage) || 0, 0), 100);
    const offset = c - (pct / 100) * c;
    const color  = pct >= 75 ? "var(--accent-green)" : pct >= 50 ? "var(--accent-warm)" : "var(--accent-red)";
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={c} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
            />
        </svg>
    );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, cfg }) {
    return (
        <div style={{
            padding: ".75rem 1rem", borderRadius: "var(--radius-sm)",
            background: cfg.bg, border: `1px solid ${cfg.color}22`,
            display: "flex", flexDirection: "column", gap: ".2rem",
        }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{value ?? 0}</div>
            <div style={{ fontSize: ".72rem", color: "var(--text-2)" }}>{label}</div>
        </div>
    );
}

// ── Stacked bar ───────────────────────────────────────────────────────────────
function StackedBar({ present, late, leave, absent }) {
    const total = present + late + leave + absent;
    const segments = [
        { key: "present", color: "var(--accent-green)", val: present },
        { key: "late",    color: "var(--accent-warm)",  val: late    },
        { key: "leave",   color: "var(--accent-2)",     val: leave   },
        { key: "absent",  color: "var(--accent-red)",   val: absent  },
    ];
    return (
        <div>
            <div style={{ height: 10, borderRadius: 100, background: "var(--bg-3)", overflow: "hidden", display: "flex" }}>
                {segments.map(({ key, color, val }) => (
                    <div key={key} style={{
                        width: total > 0 ? `${(val / total) * 100}%` : "0%",
                        background: color, transition: "width 1s ease",
                    }} />
                ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: ".5rem", flexWrap: "wrap" }}>
                {segments.map(({ key, color, val }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".72rem", color: "var(--text-2)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                        <span style={{ textTransform: "capitalize" }}>{key}:</span>
                        <strong style={{ color }}>{val}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Monthly bar chart ─────────────────────────────────────────────────────────
function MonthlyBarChart({ allRecords, activeYear, activeMonth, onMonthClick }) {
    return (
        <div>
            <div style={{ fontSize: ".75rem", color: "var(--text-3)", marginBottom: ".75rem", fontWeight: 600 }}>
                Monthly Presence Rate — {activeYear}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
                {MONTH_NAMES.map((name, idx) => {
                    const m     = idx + 1;
                    const recs  = allRecords.filter(r => {
                        const d = new Date(r.date);
                        return d.getMonth() + 1 === m && d.getFullYear() === activeYear;
                    });
                    const pres  = recs.filter(r => r.status === "Present").length;
                    const total = recs.length;
                    const pct   = total > 0 ? (pres / total) * 100 : 0;
                    const isActive = m === activeMonth;
                    const barColor = pct >= 75 ? "var(--accent-green)"
                                   : pct >= 50 ? "var(--accent-warm)"
                                   : pct > 0   ? "var(--accent-red)"
                                   : "var(--bg-3)";
                    return (
                        <div key={name} onClick={() => onMonthClick(m)}
                            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
                            <div style={{ fontSize: ".5rem", color: isActive ? "var(--accent)" : "var(--text-3)", fontWeight: isActive ? 700 : 400, minHeight: 12 }}>
                                {pct > 0 ? `${Math.round(pct)}%` : ""}
                            </div>
                            <div style={{
                                width: "100%", borderRadius: "3px 3px 0 0",
                                height: `${Math.max(pct * 0.65, total > 0 ? 4 : 0)}px`,
                                background: barColor,
                                outline: isActive ? `2px solid var(--accent)` : "2px solid transparent",
                                transition: "height .6s ease, outline .2s",
                            }} />
                            <div style={{ fontSize: ".5rem", color: isActive ? "var(--accent)" : "var(--text-3)", fontWeight: isActive ? 700 : 400 }}>
                                {name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Mini calendar ─────────────────────────────────────────────────────────────
function MonthCalendar({ year, month, records }) {
    const recordMap = {};
    records.forEach(r => {
        const d = new Date(r.date);
        if (d.getMonth() + 1 === month && d.getFullYear() === year)
            recordMap[d.getDate()] = r.status;
    });
    const firstDay    = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
                {["S","M","T","W","T","F","S"].map((d, i) => (
                    <div key={i} style={{ textAlign: "center", fontSize: ".6rem", color: "var(--text-3)", fontWeight: 600, padding: "2px 0" }}>{d}</div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={`b-${i}`} />;
                    const status  = recordMap[day];
                    const cfg     = status ? STATUS_CONFIG[status] : null;
                    const isToday = new Date().getDate() === day &&
                                    new Date().getMonth() + 1 === month &&
                                    new Date().getFullYear() === year;
                    return (
                        <div key={day} title={status || ""} style={{
                            width: "100%", aspectRatio: "1", borderRadius: 4,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: ".62rem", fontWeight: isToday ? 700 : 400,
                            background: cfg ? cfg.bg : "transparent",
                            color: cfg ? cfg.color : isToday ? "var(--accent)" : "var(--text-2)",
                            border: isToday ? "1px solid var(--accent)" : "1px solid transparent",
                        }}>
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcStats(records) {
    const present = records.filter(r => r.status === "Present").length;
    const absent  = records.filter(r => r.status === "Absent").length;
    const late    = records.filter(r => r.status === "Late").length;
    const leave   = records.filter(r => r.status === "Leave").length;
    const total   = records.length;
    const pct     = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    return { present, absent, late, leave, total, pct };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AttendancePage() {
    const userString = localStorage.getItem("user");
    const user       = userString ? JSON.parse(userString) : null;
    const token      = localStorage.getItem("token");

    const [studentId,   setStudentId]   = useState(null);
    const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1);
    const [activeYear,  setActiveYear]  = useState(new Date().getFullYear());
    const [view,        setView]        = useState("overview"); // overview | history
    const [filterMode,  setFilterMode]  = useState("month");   // month | year

    // Fetch student _id
    useEffect(() => {
        const load = async () => {
            if (!user?._id) return;
            try {
                const res  = await fetch(`http://localhost:5000/api/students/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setStudentId(data.data?._id ?? null);
            } catch (e) { console.error(e); }
        };
        load();
    }, [user?._id]);

    // Fetch all attendance records
    const { data: attData, loading } = useFetch(
        studentId ? `/api/attendance/student/${studentId}` : null,
        [studentId]
    );

    const allRecords = attData?.data?.attendanceRecords || [];

    // Unique years
    const years = useMemo(() => {
        const ys = [...new Set(allRecords.map(r => new Date(r.date).getFullYear()))].sort((a, b) => b - a);
        if (!ys.includes(activeYear)) ys.unshift(activeYear);
        return ys;
    }, [allRecords, activeYear]);

    // ── Derived stats based on filterMode ──────────────────────────────────
    const filteredRecords = useMemo(() => {
        if (filterMode === "year") {
            return allRecords.filter(r => new Date(r.date).getFullYear() === activeYear);
        }
        return allRecords.filter(r => {
            const d = new Date(r.date);
            return d.getMonth() + 1 === activeMonth && d.getFullYear() === activeYear;
        });
    }, [allRecords, filterMode, activeMonth, activeYear]);

    const displayStats  = useMemo(() => calcStats(filteredRecords), [filteredRecords]);
    const overallStats  = useMemo(() => calcStats(allRecords), [allRecords]);

    // pct color helpers
    const displayPct   = parseFloat(displayStats.pct);
    const overallPct   = parseFloat(overallStats.pct);
    const pctColor     = (p) => p >= 75 ? "var(--accent-green)" : p >= 50 ? "var(--accent-warm)" : "var(--accent-red)";

    // History list: filter by year always when in year mode, else show all sorted
    const historyRecords = useMemo(() => {
        const base = filterMode === "year"
            ? allRecords.filter(r => new Date(r.date).getFullYear() === activeYear)
            : allRecords.filter(r => {
                const d = new Date(r.date);
                return d.getMonth() + 1 === activeMonth && d.getFullYear() === activeYear;
            });
        return [...base].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allRecords, filterMode, activeMonth, activeYear]);

    // Navigator helpers
    const prevMonth = () => {
        let m = activeMonth - 1, y = activeYear;
        if (m < 1) { m = 12; y--; }
        setActiveMonth(m); setActiveYear(y);
    };
    const nextMonth = () => {
        let m = activeMonth + 1, y = activeYear;
        if (m > 12) { m = 1; y++; }
        setActiveMonth(m); setActiveYear(y);
    };

    const scopeLabel = filterMode === "year"
        ? `${activeYear} — Full Year`
        : `${MONTH_NAMES[activeMonth - 1]} ${activeYear}`;

    return (
        <div style={{ animation: "fadeUp .4s ease both" }}>
            <div className="page-header">
                <h1>Attendance</h1>
                <p>Your attendance record, breakdown, and statistics.</p>
            </div>

            {/* ── Top toolbar ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
                {/* Tabs */}
                <div className="tabs" style={{ margin: 0 }}>
                    {[["overview","Overview"], ["history","History"]].map(([v, l]) => (
                        <button key={v} className={`tab ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{l}</button>
                    ))}
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {/* Month / Year toggle */}
                    <div style={{ display: "flex", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                        {[["month","Month"], ["year","Year"]].map(([v, l]) => (
                            <button key={v} onClick={() => setFilterMode(v)} style={{
                                padding: ".3rem .75rem", fontSize: ".75rem", fontWeight: 600, border: "none", cursor: "pointer",
                                background: filterMode === v ? "var(--accent)" : "var(--bg-3)",
                                color: filterMode === v ? "#fff" : "var(--text-2)",
                                transition: "background .2s",
                            }}>{l}</button>
                        ))}
                    </div>

                    {/* Month select (only when mode = month) */}
                    {filterMode === "month" && (
                        <select value={activeMonth} onChange={e => setActiveMonth(+e.target.value)}
                            style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-1)", borderRadius: "var(--radius-sm)", padding: ".35rem .7rem", fontSize: ".8rem" }}>
                            {MONTH_NAMES.map((name, i) => (
                                <option key={i + 1} value={i + 1}>{name}</option>
                            ))}
                        </select>
                    )}

                    {/* Year select */}
                    <select value={activeYear} onChange={e => setActiveYear(+e.target.value)}
                        style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-1)", borderRadius: "var(--radius-sm)", padding: ".35rem .7rem", fontSize: ".8rem" }}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    {/* Prev / Next (month mode only) */}
                    {filterMode === "month" && (
                        <>
                            <button className="btn btn-ghost" style={{ padding: ".35rem .7rem" }} onClick={prevMonth}>←</button>
                            <button className="btn btn-ghost" style={{ padding: ".35rem .7rem" }} onClick={nextMonth}>→</button>
                        </>
                    )}
                </div>
            </div>

            {loading && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius)" }} />
                    ))}
                </div>
            )}

            {!loading && (
                <>
                    {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════ */}
                    {view === "overview" && (
                        <div>
                            {/* ── Summary header ── */}
                            <div style={{ marginBottom: ".5rem", fontSize: ".8rem", color: "var(--text-3)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
                                Showing: {scopeLabel}
                            </div>

                            {/* ── Stat pills row ── */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: ".75rem", marginBottom: "1.5rem" }}>
                                <StatPill label="Present" value={displayStats.present} cfg={STATUS_CONFIG.Present} />
                                <StatPill label="Absent"  value={displayStats.absent}  cfg={STATUS_CONFIG.Absent}  />
                                <StatPill label="Late"    value={displayStats.late}    cfg={STATUS_CONFIG.Late}    />
                                <StatPill label="Leave"   value={displayStats.leave}   cfg={STATUS_CONFIG.Leave}   />
                                {/* Total days card */}
                                <div style={{
                                    padding: ".75rem 1rem", borderRadius: "var(--radius-sm)",
                                    background: "var(--bg-2)", border: "1px solid var(--border)",
                                    display: "flex", flexDirection: "column", gap: ".2rem",
                                }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{displayStats.total}</div>
                                    <div style={{ fontSize: ".72rem", color: "var(--text-2)" }}>Total Days</div>
                                </div>
                            </div>

                            {/* ── Main chart card ── */}
                            <div className="card" style={{ marginBottom: "1.5rem" }}>
                                {/* Ring + stacked bar */}
                                <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                                    {/* Ring */}
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        <RingChart percentage={displayPct} size={130} stroke={12} />
                                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: pctColor(displayPct), lineHeight: 1 }}>{displayStats.pct}%</div>
                                            <div style={{ fontSize: ".6rem", color: "var(--text-3)", marginTop: 2 }}>
                                                {filterMode === "year" ? "this year" : "this month"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: stacked bar + warning */}
                                    <div style={{ flex: 1, minWidth: 220 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", color: "var(--text-3)", marginBottom: ".5rem" }}>
                                            <span style={{ fontWeight: 600 }}>Attendance Posture</span>
                                            <span style={{ color: pctColor(displayPct), fontWeight: 700 }}>{displayStats.pct}%</span>
                                        </div>
                                        <StackedBar
                                            present={displayStats.present}
                                            late={displayStats.late}
                                            leave={displayStats.leave}
                                            absent={displayStats.absent}
                                        />
                                        {displayPct < 75 && displayStats.total > 0 && (
                                            <div style={{ marginTop: ".75rem", padding: ".6rem .9rem", borderRadius: "var(--radius-sm)", background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.25)", fontSize: ".78rem", color: "var(--accent-red)" }}>
                                                ⚠ Attendance below 75%. Please regularise.
                                            </div>
                                        )}
                                        {displayStats.total === 0 && (
                                            <div style={{ marginTop: ".75rem", fontSize: ".78rem", color: "var(--text-3)" }}>
                                                No records for this period.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Monthly bar chart (always shows full year context) */}
                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                                    <MonthlyBarChart
                                        allRecords={allRecords}
                                        activeYear={activeYear}
                                        activeMonth={activeMonth}
                                        onMonthClick={(m) => { setActiveMonth(m); setFilterMode("month"); }}
                                    />
                                </div>

                                {/* Overall all-time ring (small, secondary) */}
                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                    <div style={{ position: "relative", flexShrink: 0 }}>
                                        <RingChart percentage={overallPct} size={72} stroke={7} />
                                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                            <div style={{ fontSize: ".85rem", fontWeight: 700, color: pctColor(overallPct), lineHeight: 1 }}>{overallStats.pct}%</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-1)" }}>All-time Overall</div>
                                        <div style={{ fontSize: ".7rem", color: "var(--text-3)", marginTop: ".2rem" }}>
                                            {overallStats.present} present · {overallStats.absent} absent · {overallStats.total} total days
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Calendar + month summary (only in month mode) ── */}
                            {filterMode === "month" && (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: ".5rem" }}>
                                        <h2 className="section-title" style={{ margin: 0 }}>
                                            {MONTH_NAMES[activeMonth - 1]} {activeYear}
                                        </h2>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.5rem", alignItems: "start" }}>
                                        {/* Calendar */}
                                        <div className="card">
                                            <MonthCalendar year={activeYear} month={activeMonth} records={allRecords} />
                                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                                                {Object.entries(STATUS_CONFIG).map(([label, cfg]) => (
                                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: ".35rem", fontSize: ".72rem", color: "var(--text-2)" }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: 2, background: cfg.bg, border: `1px solid ${cfg.color}` }} />
                                                        {label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Month stat cards */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                                            <div className="card" style={{ textAlign: "center", padding: "1rem" }}>
                                                <div style={{ position: "relative", display: "inline-block", marginBottom: ".4rem" }}>
                                                    <RingChart percentage={displayStats.pct} size={90} stroke={8} />
                                                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: pctColor(parseFloat(displayStats.pct)) }}>
                                                            {displayStats.pct}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
                                                    {MONTH_NAMES[activeMonth - 1]} {activeYear}
                                                </div>
                                            </div>

                                            {[
                                                ["Present", displayStats.present, STATUS_CONFIG.Present],
                                                ["Absent",  displayStats.absent,  STATUS_CONFIG.Absent],
                                                ["Late",    displayStats.late,    STATUS_CONFIG.Late],
                                                ["Leave",   displayStats.leave,   STATUS_CONFIG.Leave],
                                            ].map(([label, val, cfg]) => (
                                                <div key={label} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".6rem 1rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                                        <span style={{ color: cfg.color, fontWeight: 700 }}>{cfg.icon}</span>
                                                        <span style={{ fontSize: ".82rem", color: "var(--text-2)" }}>{label}</span>
                                                    </div>
                                                    <span style={{ fontWeight: 700, color: cfg.color }}>{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Year mode: month breakdown table ── */}
                            {filterMode === "year" && (
                                <>
                                    <h2 className="section-title">Monthly Breakdown — {activeYear}</h2>
                                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8rem" }}>
                                            <thead>
                                                <tr style={{ background: "var(--bg-3)", borderBottom: "1px solid var(--border)" }}>
                                                    {["Month", "Present", "Absent", "Late", "Leave", "Total", "Rate"].map(h => (
                                                        <th key={h} style={{ padding: ".65rem 1rem", textAlign: h === "Month" ? "left" : "center", color: "var(--text-3)", fontWeight: 600, fontSize: ".72rem", letterSpacing: ".04em", textTransform: "uppercase" }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {MONTH_NAMES.map((name, idx) => {
                                                    const m    = idx + 1;
                                                    const recs = allRecords.filter(r => {
                                                        const d = new Date(r.date);
                                                        return d.getMonth() + 1 === m && d.getFullYear() === activeYear;
                                                    });
                                                    const s   = calcStats(recs);
                                                    const p   = parseFloat(s.pct);
                                                    const isCurrentMonth = m === new Date().getMonth() + 1 && activeYear === new Date().getFullYear();
                                                    return (
                                                        <tr key={name}
                                                            onClick={() => { setActiveMonth(m); setFilterMode("month"); }}
                                                            style={{
                                                                borderBottom: "1px solid var(--border)",
                                                                cursor: "pointer",
                                                                background: isCurrentMonth ? "rgba(108,143,255,.05)" : "transparent",
                                                                transition: "background .15s",
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-2)"}
                                                            onMouseLeave={e => e.currentTarget.style.background = isCurrentMonth ? "rgba(108,143,255,.05)" : "transparent"}
                                                        >
                                                            <td style={{ padding: ".6rem 1rem", color: "var(--text-1)", fontWeight: isCurrentMonth ? 700 : 400 }}>
                                                                {name} {isCurrentMonth && <span style={{ fontSize: ".65rem", color: "var(--accent)", marginLeft: ".35rem" }}>current</span>}
                                                            </td>
                                                            <td style={{ textAlign: "center", color: STATUS_CONFIG.Present.color, fontWeight: 600 }}>{s.present || "—"}</td>
                                                            <td style={{ textAlign: "center", color: STATUS_CONFIG.Absent.color,  fontWeight: 600 }}>{s.absent  || "—"}</td>
                                                            <td style={{ textAlign: "center", color: STATUS_CONFIG.Late.color,    fontWeight: 600 }}>{s.late    || "—"}</td>
                                                            <td style={{ textAlign: "center", color: STATUS_CONFIG.Leave.color,   fontWeight: 600 }}>{s.leave   || "—"}</td>
                                                            <td style={{ textAlign: "center", color: "var(--text-2)" }}>{s.total || "—"}</td>
                                                            <td style={{ textAlign: "center" }}>
                                                                {s.total > 0 ? (
                                                                    <span style={{ padding: ".15rem .5rem", borderRadius: 100, fontSize: ".7rem", fontWeight: 700, background: p >= 75 ? "rgba(74,222,128,.12)" : p >= 50 ? "rgba(245,158,107,.12)" : "rgba(248,113,113,.12)", color: pctColor(p) }}>
                                                                        {s.pct}%
                                                                    </span>
                                                                ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ══ HISTORY TAB ═══════════════════════════════════════════════════ */}
                    {view === "history" && (
                        <div>
                            <div style={{ marginBottom: ".75rem", fontSize: ".8rem", color: "var(--text-3)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
                                Showing: {scopeLabel} · {historyRecords.length} record{historyRecords.length !== 1 ? "s" : ""}
                            </div>

                            {historyRecords.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <h3>No records found</h3>
                                    <p>No attendance records for this period.</p>
                                </div>
                            )}

                            <div className="schedule-list">
                                {historyRecords.map((record, i) => {
                                    const cfg  = STATUS_CONFIG[record.status] || STATUS_CONFIG.Present;
                                    const date = new Date(record.date);
                                    return (
                                        <div key={record._id || i} className="schedule-item"
                                            style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}>
                                            <span className="schedule-time" style={{ minWidth: 90 }}>
                                                {date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                            <div className="schedule-dot" style={{ background: cfg.color }} />
                                            <div className="schedule-info">
                                                <div className="schedule-course">
                                                    {date.toLocaleDateString([], { weekday: "long" })}
                                                </div>
                                                {record.remarks    && <div className="schedule-room">{record.remarks}</div>}
                                                {record.leaveReason && <div className="schedule-room">Reason: {record.leaveReason}</div>}
                                            </div>
                                            <span style={{ padding: ".2rem .65rem", borderRadius: "100px", fontSize: ".7rem", fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                                {cfg.icon} {record.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}