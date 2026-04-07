import { useFetch } from "../../hooks/useFetch";
import { useParams, useNavigate } from "react-router-dom";

const STATUS_BADGE = {
  paid:           { cls: "badge-green",  label: "Paid" },
  unpaid:         { cls: "badge-red",    label: "Unpaid" },
  partial:        { cls: "badge-yellow", label: "Partial" },
  partially_paid: { cls: "badge-yellow", label: "Partial" },
};

export default function InvoiceDetail() {
  const { id } = useParams();   // ✅ get id from URL
  const navigate = useNavigate(); // ✅ also fix navigate
  const { data, loading } = useFetch(id ? `/api/fees/invoices/${id}` : null, [id]);
  console.log(data);
  const invoice = data?.data?.invoice;
  const payments = data?.data?.payments || [];

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Invoice</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; padding: 2rem; color: #111; }
        h1 { font-family: serif; font-size: 2rem; margin-bottom: .5rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: .75rem; text-align: left; border-bottom: 1px solid #eee; }
        th { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: #666; }
        .header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .badge { display: inline-block; padding: .2rem .7rem; border-radius: 100px; font-size: .75rem; font-weight: 600; }
        .paid { background: #d1fae5; color: #065f46; }
        .unpaid { background: #fee2e2; color: #991b1b; }
        .total { text-align: right; padding-top: 1rem; border-top: 2px solid #111; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div class="header">
        <div><h1>🎓 EduPortal</h1><p>School Management System</p></div>
        <div style="text-align:right">
          <div style="font-size:1.2rem;font-weight:600">${invoice?.invoiceNumber || ""}</div>
          <div style="color:#666">${invoice?.invoiceType?.toUpperCase() || ""} INVOICE</div>
          <div class="badge ${invoice?.status === 'paid' ? 'paid' : 'unpaid'}">${invoice?.status?.toUpperCase() || ""}</div>
        </div>
      </div>
      <p><strong>Student:</strong> ${invoice?.student?.firstName || ""} ${invoice?.student?.lastName || ""}</p>
      <p><strong>Roll #:</strong> ${invoice?.student?.rollNumber || "—"}</p>
      <p><strong>Class:</strong> ${invoice?.class?.name || "—"}</p>
      <p><strong>Due Date:</strong> ${invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</p>
      <h3 style="margin-top:1.5rem">Fee Items</h3>
      <table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${(invoice?.feeItems || []).map(item => `<tr><td>${item.title}${item.description ? `<br><small style="color:#666">${item.description}</small>` : ""}</td><td>PKR ${item.amount?.toLocaleString()}</td></tr>`).join("")}
        </tbody>
      </table>
      ${invoice?.discount > 0 ? `<p style="text-align:right;color:#666">Discount: PKR ${invoice.discount?.toLocaleString()}</p>` : ""}
      <div class="total">
        <strong>Total Amount: PKR ${invoice?.totalAmount?.toLocaleString()}</strong><br>
        Paid: PKR ${invoice?.paidAmount?.toLocaleString() || 0}<br>
        <strong>Remaining: PKR ${((invoice?.totalAmount || 0) - (invoice?.paidAmount || 0)).toLocaleString()}</strong>
      </div>
      <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>`);
    w.document.close();
  };

  if (loading) return <div className="loading-screen"><div className="loader-ring"></div><p>Loading invoice…</p></div>;
  if (!invoice) return (
    <div className="empty-state">
      <div className="empty-state-icon">🧾</div>
      <h3>Invoice not found</h3>
      <button className="btn btn-ghost" onClick={() => navigate("/student/fees")}>← Back to Invoices</button>
    </div>
  );

  const status = STATUS_BADGE[invoice.status] || STATUS_BADGE.unpaid;
  const remaining = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);

  return (
    <div style={{ animation: "fadeUp .4s ease both", maxWidth: 800 }}>
      <div className="flex items-center gap-2 mb-3">
        <button className="btn btn-ghost" onClick={() => navigate("/student/fees")}>← Back</button>
        <span className="text-muted text-sm">Fee Invoices</span>
      </div>

      {/* Invoice header */}
      <div className="invoice-header">
        <div>
          <div style={{ fontFamily: "monospace", color: "var(--text-3)", fontSize: ".8rem", marginBottom: ".25rem" }}>
            {invoice.invoiceNumber}
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 400 }}>{invoice.title}</h2>
          <div style={{ color: "var(--text-2)", fontSize: ".875rem", marginTop: ".25rem" }}>
            Due: {new Date(invoice.dueDate).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ marginTop: ".75rem" }}>
            <span className={`badge ${status.cls}`}>{status.label}</span>
            <span className="badge badge-gray" style={{ marginLeft: ".5rem" }}>{invoice.invoiceType}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--text-3)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".06em" }}>Total Amount</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem" }}>
            PKR {(invoice.totalAmount || 0).toLocaleString()}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: ".75rem" }} onClick={handlePrint}>🖨 Print</button>
        </div>
      </div>

      {/* Student info */}
      <div className="card mb-2">
        <div className="card-title">Student Information</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[
            ["Name", `${invoice.student?.firstName || ""} ${invoice.student?.lastName || ""}`],
            ["Roll Number", invoice.student?.rollNumber || "—"],
            ["Class", invoice.class?.name || "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs">{label}</div>
              <div style={{ fontSize: ".9rem", fontWeight: 500, marginTop: ".2rem" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee items */}
      <div className="card mb-2">
        <div className="card-title">Fee Breakdown</div>
        <table className="invoice-items">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.feeItems || []).map((item, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  {item.description && <div className="text-xs">{item.description}</div>}
                </td>
                <td style={{ textAlign: "right" }}>PKR {(item.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-total">
          {invoice.discount > 0 && (
            <div style={{ color: "var(--text-2)", fontSize: ".875rem", marginBottom: ".5rem" }}>
              Discount ({invoice.discountType}): − PKR {(invoice.discount || 0).toLocaleString()}
            </div>
          )}
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Total: PKR {(invoice.totalAmount || 0).toLocaleString()}
          </div>
          <div style={{ color: "var(--accent-green)", fontSize: ".9rem", marginTop: ".25rem" }}>
            Paid: PKR {(invoice.paidAmount || 0).toLocaleString()}
          </div>
          <div style={{ color: remaining > 0 ? "var(--accent-red)" : "var(--text-2)", fontSize: ".9rem" }}>
            Remaining: PKR {remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="card">
          <div className="card-title">Payment History</div>
          <div className="table-wrap" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Received By</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{p.paymentMethod || "—"}</td>
                    <td style={{ fontFamily: "monospace", fontSize: ".78rem" }}>{p.referenceNumber || "—"}</td>
                    <td>{p.receivedBy ? `${p.receivedBy.firstName} ${p.receivedBy.lastName}` : "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>PKR {(p.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}