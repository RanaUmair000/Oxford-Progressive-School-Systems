import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

// ─── API helpers ──────────────────────────────────────────────────────────────
const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: apiUrl,
});
api.interceptors.request.use((c) => {
    const token = localStorage.getItem("token");
    if (token) c.headers.Authorization = `Bearer ${token}`;
    return c;
});

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "—";

const fmtSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const SCOPE_LABELS = { class: "Whole Class", student: "One Student" };
const TYPE_LABELS = { diary: "Diary Entry", material: "Study Material" };
const TYPE_ICONS = { diary: "📓", material: "📚" };
const SCOPE_ICONS = { class: "🏫", student: "👤" };

// ─── Sub-components ───────────────────────────────────────────────────────────

const Spinner = () => (
    <div className="stock-spinner" />
);

const Alert = ({ msg, kind = "danger", onClose }) =>
    msg ? (
        <div className={`alert alert--${kind}`}>
            <span>{msg}</span>
            {onClose && (
                <button className="alert__close" onClick={onClose}>×</button>
            )}
        </div>
    ) : null;

const Badge = ({ children, variant = "primary" }) => (
    <span className={`badge badge--${variant}`}>{children}</span>
);

const StatCard = ({ icon, title, value, variant = "primary" }) => (
    <div className={`stat-card stat-card--${variant}`}>
        <div>
            <p className="stat-card__title">{title}</p>
            <p className="stat-card__value">{value ?? "—"}</p>
        </div>
        <div className="stat-card__icon">
            <span style={{ fontSize: 22 }}>{icon}</span>
        </div>
    </div>
);

// Attachment preview chip
const AttachChip = ({ att, onDelete }) => (
    <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px 4px 8px", borderRadius: 6,
        background: att.type === "pdf" ? "rgba(239,68,68,0.08)" : "rgba(60,80,224,0.08)",
        border: `1px solid ${att.type === "pdf" ? "rgba(239,68,68,0.2)" : "rgba(60,80,224,0.2)"}`,
        fontSize: 12, color: att.type === "pdf" ? "var(--danger)" : "var(--primary)",
        marginRight: 6, marginBottom: 6,
    }}>
        <span>{att.type === "pdf" ? "📄" : "🖼️"}</span>
        <a
            href={`/${att.path}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "none", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
            {att.originalName}
        </a>
        {fmtSize(att.size) && <span style={{ opacity: 0.6 }}>· {fmtSize(att.size)}</span>}
        {onDelete && (
            <button
                onClick={onDelete}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "inherit", opacity: 0.7, fontSize: 14 }}
                title="Remove"
            >×</button>
        )}
    </div>
);

// ─── Entry Card ───────────────────────────────────────────────────────────────
const EntryCard = ({ entry, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const isDiary = entry.type === "diary";
    const accentMap = { diary: "primary", material: "success" };
    const accent = accentMap[entry.type] || "primary";

    return (
        <div style={{
            background: "var(--white)",
            border: "1px solid var(--stroke)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.2s",
        }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
        >
            {/* Header strip */}
            <div style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--stroke)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{TYPE_ICONS[entry.type]}</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--black)" }}>{entry.title}</div>
                        <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2, color: "var(--black)" }}>
                            {fmtDate(entry.date)}
                            {entry.subject && ` · ${entry.subject}`}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Badge variant={accent}>{TYPE_LABELS[entry.type]}</Badge>
                    <Badge variant={entry.scope === "student" ? "warning" : "info"}>
                        {SCOPE_ICONS[entry.scope]} {entry.scope === "student"
                            ? `${entry.studentId?.firstName || ""} ${entry.studentId?.lastName || ""}`
                            : `${entry.classId?.name || ""} ${entry.classId?.section ? "· " + entry.classId.section : ""}`
                        }
                    </Badge>
                    <Badge variant={entry.status === "Published" ? "success" : "warning"}>
                        {entry.status}
                    </Badge>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: "14px 18px" }}>
                {entry.description && (
                    <p style={{ fontSize: 13, color: "var(--black)", opacity: 0.75, margin: "0 0 10px", lineHeight: 1.6 }}>
                        {entry.description}
                    </p>
                )}
                {isDiary && entry.homework && (
                    <div style={{
                        background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 8, padding: "10px 14px", marginBottom: 10,
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Homework</div>
                        <div style={{ fontSize: 13, color: "var(--black)", lineHeight: 1.6 }}>{entry.homework}</div>
                    </div>
                )}

                {/* Attachments */}
                {entry.attachments?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, color: "var(--black)" }}>
                            Attachments ({entry.attachments.length})
                        </div>
                        <div>
                            {entry.attachments.map((a) => (
                                <AttachChip key={a._id} att={a} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                    <button className="btn btn--outline btn--sm" onClick={() => onEdit(entry)}>✏️ Edit</button>
                    <button className="btn btn--danger btn--sm" onClick={() => onDelete(entry._id)}>🗑️ Delete</button>
                </div>
            </div>
        </div>
    );
};

// ─── Form Modal ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
    scope: "class",
    type: "diary",
    classId: "",
    studentId: "",
    title: "",
    description: "",
    homework: "",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    status: "Published",
    academicYear: "",
};

const Modal = ({ show, onClose, children }) => {
    if (!show) return null;
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
        }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: "var(--white)",
                borderRadius: 14, width: "100%", maxWidth: 700,
                maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                border: "1px solid var(--stroke)",
            }}>
                {children}
            </div>
        </div>
    );
};

const DiaryForm = ({ initial, classes, students, onSave, onClose, saving }) => {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const fileRef = useRef();

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const filteredStudents = form.classId
        ? students.filter((s) => {
            const sc = typeof s.class === "object" ? s.class?._id : s.class;
            return sc?.toString() === form.classId;
        })
        : students;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError("Title is required"); return; }
        if (form.scope === "class" && !form.classId) { setError("Please select a class"); return; }
        if (form.scope === "student" && !form.studentId) { setError("Please select a student"); return; }
        setError("");
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        files.forEach((f) => fd.append("attachments", f));
        onSave(fd, !!initial);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--stroke)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--black)" }}>
                    {initial ? "Edit Entry" : "New Diary / Material Entry"}
                </h3>
                <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1, color: "var(--black)", opacity: 0.5 }}>×</button>
            </div>

            <div style={{ padding: "24px 28px" }}>
                <Alert msg={error} onClose={() => setError("")} />

                {/* Type + Scope */}
                <div className="form-grid form-grid--2" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Entry Type</label>
                        <select className="form-select" value={form.type} onChange={(e) => set("type", e.target.value)}>
                            <option value="diary">📓 Diary Entry</option>
                            <option value="material">📚 Study Material</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Scope</label>
                        <select className="form-select" value={form.scope} onChange={(e) => set("scope", e.target.value)}>
                            <option value="class">🏫 Whole Class</option>
                            <option value="student">👤 One Student</option>
                        </select>
                    </div>
                </div>

                {/* Class selector (always show for class scope; also for student scope to pre-filter) */}
                <div className="form-grid form-grid--2" style={{ marginBottom: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Class {form.scope === "class" ? "*" : "(to filter students)"}</label>
                        <select
                            className="form-select"
                            value={form.classId}
                            onChange={(e) => { set("classId", e.target.value); set("studentId", ""); }}
                            required={form.scope === "class"}
                        >
                            <option value="">— Select Class —</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>{c.name} {c.section ? `· ${c.section}` : ""}</option>
                            ))}
                        </select>
                    </div>

                    {form.scope === "student" && (
                        <div className="form-group">
                            <label className="form-label">Student *</label>
                            <select
                                className="form-select"
                                value={form.studentId}
                                onChange={(e) => set("studentId", e.target.value)}
                                required
                            >
                                <option value="">— Select Student —</option>
                                {filteredStudents.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.firstName} {s.lastName} {s.rollNumber ? `(${s.rollNumber})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Date *</label>
                        <input type="date" className="form-input" value={form.date} onChange={(e) => set("date", e.target.value)} required />
                    </div>
                </div>

                {/* Title + Subject */}
                <div className="form-grid form-grid--2" style={{ marginBottom: 20 }}>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">Title *</label>
                        <input type="text" className="form-input" placeholder="e.g. Chapter 3 Notes" value={form.title} onChange={(e) => set("title", e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subject / Topic</label>
                        <input type="text" className="form-input" placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Academic Year</label>
                        <input type="text" className="form-input" placeholder="e.g. 2024-2025" value={form.academicYear} onChange={(e) => set("academicYear", e.target.value)} />
                    </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Description / Notes</label>
                    <textarea className="form-input" rows={3} placeholder="Write notes, instructions, or any content here…" value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>

                {/* Homework — diary only */}
                {form.type === "diary" && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Homework</label>
                        <textarea className="form-input" rows={2} placeholder="Write homework tasks here…" value={form.homework} onChange={(e) => set("homework", e.target.value)} />
                    </div>
                )}

                {/* Status */}
                <div className="form-group" style={{ marginBottom: 20, maxWidth: 200 }}>
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={(e) => set("status", e.target.value)}>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>

                {/* File Upload */}
                <div style={{
                    border: "2px dashed var(--stroke)", borderRadius: 10, padding: "20px 16px",
                    textAlign: "center", marginBottom: 16, cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const dropped = Array.from(e.dataTransfer.files).filter((f) =>
                            ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(f.type)
                        );
                        setFiles((p) => [...p, ...dropped]);
                    }}
                >
                    <input ref={fileRef} type="file" multiple accept=".pdf,image/*" style={{ display: "none" }}
                        onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files)])}
                    />
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--black)" }}>Drop PDFs or Images here</div>
                    <div style={{ fontSize: 12, opacity: 0.5, marginTop: 3, color: "var(--black)" }}>or click to browse · up to 10 files · 20MB each</div>
                </div>

                {files.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        {files.map((f, i) => (
                            <AttachChip
                                key={i}
                                att={{ type: f.type === "application/pdf" ? "pdf" : "image", originalName: f.name, size: f.size, path: "" }}
                                onDelete={() => setFiles((p) => p.filter((_, j) => j !== i))}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                    {saving ? "Saving…" : initial ? "Update Entry" : "Create Entry"}
                </button>
            </div>
        </form>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiaryPage() {
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editEntry, setEditEntry] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Filters
    const [filterType, setFilterType] = useState("");
    const [filterScope, setFilterScope] = useState("");
    const [filterClass, setFilterClass] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const flash = (msg, kind = "success") => {
        if (kind === "success") setSuccess(msg);
        else setError(msg);
        setTimeout(() => { setSuccess(""); setError(""); }, 4000);
    };

    const loadAll = useCallback(async () => {
        try {
            setLoading(true);
            const role = localStorage.getItem("role");
            const params = { page, limit: 12 };
            if (filterType) params.type = filterType;
            if (filterScope) params.scope = filterScope;
            if (filterClass) params.classId = filterClass;
            if (filterStatus) params.status = filterStatus;
            if (filterDate) { params.dateFrom = filterDate; params.dateTo = filterDate; }

            // 👇 teacher scope: backend will filter by teacherId
            if (role !== "admin") params.myOnly = true;

            const [eRes, sRes, cRes, stRes] = await Promise.all([
                api.get("/api/diary", { params }),
                api.get("/api/diary/stats", { params: role !== "admin" ? { myOnly: true } : {} }),
                role === "admin"
                    ? api.get("/api/classes")
                    : api.get("/api/teachers/classes"),
                api.get("/api/students"),
            ]);

            setEntries(eRes.data.data);
            setPagination(eRes.data.pagination || {});
            setStats(sRes.data.data);

            const rawClasses = role === "admin"
                ? (Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || [])
                : (cRes.data?.data || []).map(c => ({
                    _id: c.classId,
                    name: c.className,
                    section: c.section,
                }));

            setClasses(rawClasses);
            setStudents(Array.isArray(stRes.data) ? stRes.data : stRes.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [page, filterType, filterScope, filterClass, filterStatus, filterDate]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleSave = async (fd, isEdit) => {
        const token = localStorage.getItem("token");
        setSaving(true);

        try {
            if (isEdit) {
                await api.put(`/api/diary/${editEntry._id}`, fd, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                });
                flash("Entry updated successfully");

            } else {
                await api.post("/api/diary", fd, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                });
                flash("Entry created successfully");
            }

            setShowModal(false);
            setEditEntry(null);
            loadAll();

        } catch (err) {
            flash(err.response?.data?.message || "Failed to save entry", "danger");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this entry? This cannot be undone.")) return;
        setDeleting(id);
        try {
            await api.delete(`/api/diary/${id}`);
            flash("Entry deleted");
            loadAll();
        } catch (err) {
            flash(err.response?.data?.message || "Failed to delete", "danger");
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (entry) => {
        setEditEntry({
            ...entry,
            classId: entry.classId?._id || entry.classId || "",
            studentId: entry.studentId?._id || entry.studentId || "",
            date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
        });
        setShowModal(true);
    };

    const openNew = () => { setEditEntry(null); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditEntry(null); };

    return (
        <div className="stock-page">
            {/* Header */}
            <div className="stock-page__header">
                <div>
                    <h1 className="stock-page__title">📓 Diary & Study Material</h1>
                    <p className="stock-page__subtitle">Manage diary entries and upload study material for your classes</p>
                </div>
                <button className="btn btn--primary" onClick={openNew}>
                    + New Entry
                </button>
            </div>

            {/* Alerts */}
            <Alert msg={success} kind="success" onClose={() => setSuccess("")} />
            <Alert msg={error} kind="danger" onClose={() => setError("")} />

            {/* Stat Cards */}
            <div className="stat-grid">
                <StatCard icon="📓" title="Total Diary Entries" value={stats?.totalDiary} variant="primary" />
                <StatCard icon="📚" title="Study Materials" value={stats?.totalMaterial} variant="success" />
                <StatCard icon="📅" title="Posted Today" value={stats?.todayCount} variant="warning" />
                <StatCard icon="📎" title="Total Entries" value={(stats?.totalDiary ?? 0) + (stats?.totalMaterial ?? 0)} variant="info" />
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <select className="form-select" style={{ maxWidth: 160 }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
                    <option value="">All Types</option>
                    <option value="diary">📓 Diary</option>
                    <option value="material">📚 Material</option>
                </select>
                <select className="form-select" style={{ maxWidth: 160 }} value={filterScope} onChange={(e) => { setFilterScope(e.target.value); setPage(1); }}>
                    <option value="">All Scopes</option>
                    <option value="class">🏫 Class</option>
                    <option value="student">👤 Student</option>
                </select>
                <select className="form-select" style={{ maxWidth: 200 }} value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}>
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                        <option key={c._id} value={c._id}>{c.name} {c.section ? `· ${c.section}` : ""}</option>
                    ))}
                </select>
                <select className="form-select" style={{ maxWidth: 150 }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                </select>
                <input type="date" className="form-input" style={{ maxWidth: 180 }} value={filterDate}
                    onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} />
                {(filterType || filterScope || filterClass || filterStatus || filterDate) && (
                    <button className="btn btn--outline btn--sm" onClick={() => {
                        setFilterType(""); setFilterScope(""); setFilterClass("");
                        setFilterStatus(""); setFilterDate(""); setPage(1);
                    }}>Clear Filters</button>
                )}
            </div>

            {/* Entries */}
            <div className="stock-section">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spinner />
                        <div style={{ fontSize: 13, opacity: 0.5, color: "var(--black)", marginTop: 8 }}>Loading entries…</div>
                    </div>
                ) : entries.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "60px 0",
                        background: "var(--white)", border: "1px solid var(--stroke)",
                        borderRadius: 12, color: "var(--black)"
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>No entries found</div>
                        <div style={{ opacity: 0.5, fontSize: 13, marginTop: 4 }}>Create your first diary entry or study material</div>
                        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={openNew}>+ New Entry</button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))" }}>
                        {entries.map((e) => (
                            <EntryCard key={e._id} entry={e} onEdit={openEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 32 }}>
                    <button className="btn btn--outline btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                    <span style={{ padding: "6px 12px", fontSize: 13, color: "var(--black)", opacity: 0.7 }}>
                        Page {page} of {pagination.pages}
                    </span>
                    <button className="btn btn--outline btn--sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
                </div>
            )}

            {/* Modal */}
            <Modal show={showModal} onClose={closeModal}>
                <DiaryForm
                    initial={editEntry}
                    classes={classes}
                    students={students}
                    onSave={handleSave}
                    onClose={closeModal}
                    saving={saving}
                />
            </Modal>
        </div>
    );
}