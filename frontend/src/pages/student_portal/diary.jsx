import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";
import { API_URL } from "../../context/AuthContext";

const TYPE_CONFIG = {
  diary:    { badge: "badge-blue",   icon: "📓", label: "Diary" },
  material: { badge: "badge-purple", icon: "📎", label: "Material" },
};

function AttachmentItem({ att }) {
  const isPdf = att.mimetype === "application/pdf" || att.type === "pdf";
  const url = `${API_URL.replace("/api", "")}/${att.path}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: ".5rem",
        padding: ".5rem .75rem", borderRadius: "var(--radius-sm)",
        background: "var(--bg-3)", border: "1px solid var(--border)",
        fontSize: ".78rem", color: "var(--text-2)",
        transition: "var(--transition)", textDecoration: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}
    >
      <span>{isPdf ? "📄" : "🖼"}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {att.originalName || att.filename}
      </span>
      <span style={{ color: "var(--accent)", fontSize: ".7rem" }}>↓</span>
    </a>
  );
}

function DiaryModal({ entry, onClose }) {
  if (!entry) return null;
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.diary;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)", maxWidth: 600, width: "100%",
        maxHeight: "90vh", overflowY: "auto", padding: "1.5rem",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center", marginBottom: ".5rem" }}>
              <span className={`badge ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
              {entry.subject && <span className="badge badge-gray">{entry.subject}</span>}
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 400 }}>{entry.title}</h2>
            <div className="text-xs" style={{ marginTop: ".3rem" }}>
              {entry.teacherId ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}` : ""}
              {" · "}{new Date(entry.date).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--text-2)",
            borderRadius: "var(--radius-sm)", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>✕</button>
        </div>

        {entry.description && (
          <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: "1rem", lineHeight: 1.7, fontSize: ".9rem" }}>
            {entry.description}
          </div>
        )}

        {entry.homework && (
          <div style={{ background: "rgba(245,158,107,.06)", border: "1px solid rgba(245,158,107,.2)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: ".72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--accent-warm)", marginBottom: ".5rem" }}>
              📝 Homework
            </div>
            <div style={{ fontSize: ".9rem", lineHeight: 1.6 }}>{entry.homework}</div>
          </div>
        )}

        {entry.attachments?.length > 0 && (
          <div>
            <div className="text-xs" style={{ marginBottom: ".5rem" }}>Attachments ({entry.attachments.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
              {entry.attachments.map((att, i) => <AttachmentItem key={i} att={att} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Diary() {
  // ✅ Read user from localStorage consistently with courses.jsx and timetable.jsx
  const userString = localStorage.getItem("user");
  const user       = userString ? JSON.parse(userString) : null;
  const token      = localStorage.getItem("token");

  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState(null);
  const [studentId, setStudentId]   = useState(null); // ✅ fetched via API

  // ✅ Fetch student record to get the real MongoDB studentId
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!user?._id) return;
        const res  = await fetch(`http://localhost:5000/api/students/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudentId(data.data?._id ?? null);
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };
    fetchStudent();
  }, [user?._id]);

  const typeParam = typeFilter !== "all" ? `&type=${typeFilter}` : "";
  const { data, loading } = useFetch(
    studentId ? `/api/diary/student/${studentId}?page=${page}&limit=12${typeParam}` : null,
    [studentId, page, typeFilter]
  );
  const entries    = data?.data       || [];
  const pagination = data?.pagination;

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      {selected && <DiaryModal entry={selected} onClose={() => setSelected(null)} />}

      <div className="page-header">
        <h1>Diary & Study Material</h1>
        <p>Homework, notes, and learning resources from your teachers.</p>
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {[["all", "All"], ["diary", "📓 Diary"], ["material", "📎 Material"]].map(([v, l]) => (
          <button
            key={v}
            className={`tab ${typeFilter === v ? "active" : ""}`}
            onClick={() => { setTypeFilter(v); setPage(1); }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Skeleton loader */}
      {loading && (
        <div className="diary-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius)" }}></div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📓</div>
          <h3>No entries found</h3>
          <p>Your teachers haven't posted any {typeFilter !== "all" ? typeFilter : ""} entries yet.</p>
        </div>
      )}

      {/* Diary cards */}
      <div className="diary-grid">
        {entries.map((entry, i) => {
          const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.diary;
          return (
            <div
              key={entry._id}
              className="diary-card"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => setSelected(entry)}
            >
              <div className="diary-card-type">
                <span className={`badge ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
                {entry.subject && (
                  <span className="badge badge-gray" style={{ fontSize: ".65rem" }}>{entry.subject}</span>
                )}
              </div>

              <div className="diary-card-title">{entry.title}</div>

              {(entry.description || entry.homework) && (
                <div className="diary-card-desc">{entry.description || entry.homework}</div>
              )}

              {entry.attachments?.length > 0 && (
                <div style={{ display: "flex", gap: ".4rem", marginBottom: ".75rem", flexWrap: "wrap" }}>
                  {entry.attachments.slice(0, 3).map((att, j) => (
                    <span key={j} style={{ fontSize: ".7rem", padding: ".15rem .5rem", background: "var(--bg-3)", borderRadius: "100px", color: "var(--text-2)" }}>
                      {att.type === "pdf" ? "📄" : "🖼"} {att.originalName?.slice(0, 12) || "file"}
                    </span>
                  ))}
                  {entry.attachments.length > 3 && (
                    <span style={{ fontSize: ".7rem", padding: ".15rem .5rem", background: "var(--bg-3)", borderRadius: "100px", color: "var(--text-2)" }}>
                      +{entry.attachments.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="diary-card-footer">
                <span className="diary-card-date">
                  {new Date(entry.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="diary-card-teacher">
                  {entry.teacherId ? `${entry.teacherId.firstName} ${entry.teacherId.lastName}` : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: ".5rem", marginTop: "1.5rem" }}>
          <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ display: "flex", alignItems: "center", fontSize: ".875rem", color: "var(--text-2)", padding: "0 .5rem" }}>
            Page {page} of {pagination.pages}
          </span>
          <button className="btn btn-ghost" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}