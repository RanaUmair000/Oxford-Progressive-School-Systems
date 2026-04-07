import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";

const STATUS_BADGE = {
  paid:           { cls: "badge-green",  label: "Paid" },
  unpaid:         { cls: "badge-red",    label: "Unpaid" },
  partial:        { cls: "badge-yellow", label: "Partial" },
  partially_paid: { cls: "badge-yellow", label: "Partial" },
};

const TYPE_BADGE = {
  monthly:     { cls: "badge-blue",   label: "Monthly" },
  annual:      { cls: "badge-purple", label: "Annual" },
  event:       { cls: "badge-yellow", label: "Event" },
  manual:      { cls: "badge-gray",   label: "Manual" },
  "semi-annual":{ cls: "badge-blue",  label: "Semi-Annual" },
};

export default function FeeInvoices() {
  const userString = localStorage.getItem("user");
  const navigate = useNavigate();
  const user = userString ? JSON.parse(userString) : null;
  const [filter, setFilter] = useState("all");
  const studentId = user?._id;

  const { data, loading } = useFetch(
    studentId ? `/api/fees/invoices?studentId=${studentId}&limit=100` : null,
    [studentId]
  );
  const invoices = data?.data || [];

  const filtered = filter === "all" ? invoices : invoices.filter(inv => inv.status === filter);

  const totals = {
    total: invoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    paid:  invoices.reduce((s, i) => s + (i.paidAmount || 0), 0),
    pending: invoices.reduce((s, i) => s + (i.totalAmount - (i.paidAmount || 0)), 0),
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div className="page-header">
        <h1>Fee Invoices</h1>
        <p>View and track all your fee invoices and payment history.</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid">
        {[
          { label: "Total Billed", value: `PKR ${totals.total.toLocaleString()}`, icon: "📋", sub: `${invoices.length} invoices` },
          { label: "Total Paid",   value: `PKR ${totals.paid.toLocaleString()}`,  icon: "✅", sub: `${invoices.filter(i => i.status === "paid").length} paid` },
          { label: "Outstanding",  value: `PKR ${totals.pending.toLocaleString()}`, icon: "⏳", sub: `${invoices.filter(i => i.status !== "paid").length} unpaid` },
          { label: "Overdue",      value: `${invoices.filter(i => i.status !== "paid" && new Date(i.dueDate) < new Date()).length}`, icon: "⚠️", sub: "Past due date" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value" style={{ fontSize: s.value.length > 8 ? "1.2rem" : "2rem" }}>{s.value}</span>
            <span className="stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {["all", "unpaid", "partial", "paid"].map(f => (
          <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span style={{ marginLeft: ".4rem", opacity: .6, fontSize: ".7rem" }}>
                ({invoices.filter(i => i.status === f || (f === "partial" && i.status === "partially_paid")).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Title</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Due Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-3)", padding: "2rem" }}>Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🧾</div>
                    <h3>No invoices found</h3>
                    <p>No fee invoices match the selected filter.</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(inv => {
              const s = STATUS_BADGE[inv.status] || STATUS_BADGE.unpaid;
              const t = TYPE_BADGE[inv.invoiceType] || TYPE_BADGE.manual;
              console.log(inv._id);
              const overdue = inv.status !== "paid" && new Date(inv.dueDate) < new Date();
              return (
                <tr key={inv._id}>
                  <td style={{ fontFamily: "monospace", fontSize: ".8rem" }}>{inv.invoiceNumber}</td>
                  <td>{inv.title}</td>
                  <td><span className={`badge ${t.cls}`}>{t.label}</span></td>
                  <td>PKR {(inv.totalAmount || 0).toLocaleString()}</td>
                  <td>PKR {(inv.paidAmount || 0).toLocaleString()}</td>
                  <td>
                    <span style={{ color: overdue ? "var(--accent-red)" : "inherit" }}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                      {overdue && " ⚠"}
                    </span>
                  </td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: ".3rem .75rem", fontSize: ".75rem" }}
                      onClick={() => navigate(`/student/invoice/${inv._id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}