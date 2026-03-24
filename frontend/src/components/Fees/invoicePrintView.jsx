/**
 * InvoicePrintView.jsx
 *
 * Usage: import and call printInvoice(invoice, payments) anywhere.
 * It opens a new tab with a print-ready styled invoice.
 *
 * Also exports <InvoicePrintButton invoice={invoice} payments={payments} />
 * — drop this into your InvoiceList action buttons.
 */

// ─── School Config ─────────────────────────────────────────────────────────────
// Change these to match your school's details
const SCHOOL_CONFIG = {
  name:    "Oxford Progressive School",
  tagline: "Nurturing Minds, Building Futures",
  address: "123 Education Lane, Gulberg III, Lahore, Punjab",
  phone:   "+92 42 3571 0000",
  email:   "accounts@beaconlight.edu.pk",
  website: "www.beaconlight.edu.pk",
  // Paste a base64 logo string here, or a public URL, or leave "" for initials
  logo:    "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 })
    .format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" }) : "—";

const TYPE_LABEL = {
  monthly:     "Monthly Fee",
  annual:      "Annual Fee",
  "semi-annual": "Semi-Annual Fee",
  quarterly:   "Quarterly Fee",
  event:       "Event Fee",
  manual:      "Manual Invoice",
  custom:      "Custom Invoice",
};

const STATUS_COLOR = {
  paid:           { bg: "#d1fae5", color: "#065f46", label: "PAID" },
  partially_paid: { bg: "#fef3c7", color: "#92400e", label: "PARTIAL" },
  unpaid:         { bg: "#fee2e2", color: "#991b1b", label: "UNPAID" },
};

// ─── HTML Generator ────────────────────────────────────────────────────────────
function buildInvoiceHTML(invoice, payments = []) {
  const sc = SCHOOL_CONFIG;
  const st = invoice.student ?? {};
  const cl = invoice.class ?? {};
  const status = STATUS_COLOR[invoice.status] ?? STATUS_COLOR.unpaid;
  const remaining = (invoice.totalAmount ?? 0) - (invoice.paidAmount ?? 0);
  const typeLabel = TYPE_LABEL[invoice.invoiceType] ?? invoice.invoiceType;

  // logo block
  const logoBlock = sc.logo
    ? `<img src="${sc.logo}" alt="Logo" style="width:64px;height:64px;object-fit:contain;border-radius:8px;" />`
    : `<div style="width:64px;height:64px;border-radius:12px;background:linear-gradient(135deg,#0d7a6b,#009179);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;letter-spacing:-1px;">
         ${sc.name.split(" ").map(w => w[0]).slice(0,2).join("")}
       </div>`;

  // fee items rows
  const feeRows = (invoice.feeItems ?? []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafb"};">
      <td style="padding:12px 20px;font-size:13.5px;color:#1a2332;">${item.title ?? "—"}</td>
      <td style="padding:12px 20px;font-size:13px;color:#64748b;">${item.description ?? ""}</td>
      <td style="padding:12px 20px;font-size:13.5px;font-weight:600;color:#1a2332;text-align:right;">${fmt(item.amount)}</td>
    </tr>`).join("");

  // payment history rows
  const paymentRows = payments.length
    ? payments.map(p => `
    <tr>
      <td style="padding:10px 16px;font-size:12.5px;color:#475569;">${fmtDate(p.paymentDate)}</td>
      <td style="padding:10px 16px;font-size:12.5px;color:#475569;">${p.receiptNumber ?? "—"}</td>
      <td style="padding:10px 16px;font-size:12.5px;color:#475569;text-transform:capitalize;">${(p.paymentMethod ?? "").replace(/_/g, " ")}</td>
      <td style="padding:10px 16px;font-size:12.5px;color:#475569;">${p.transactionId || p.chequeNumber || "—"}</td>
      <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#065f46;text-align:right;">${fmt(p.amount)}</td>
    </tr>`).join("")
    : `<tr><td colspan="5" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No payments recorded yet</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Invoice ${invoice.invoiceNumber ?? ""} — ${sc.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "DM Sans", sans-serif;
      background: #f0f4f8;
      color: #1a2332;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Toolbar (screen only) ── */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 32px;
      background: #0d7a6b;
      color: #fff;
      gap: 12px;
    }
    .toolbar span { font-size: 14px; opacity: 0.85; }
    .toolbar-btns { display: flex; gap: 10px; }
    .btn-print {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 9px 20px; border-radius: 8px; font-size: 13.5px;
      font-weight: 600; cursor: pointer; border: none;
      background: #fff; color: #0d7a6b; transition: opacity .15s;
    }
    .btn-print:hover { opacity: .88; }
    .btn-close {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 9px 20px; border-radius: 8px; font-size: 13.5px;
      font-weight: 600; cursor: pointer;
      background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3);
      transition: background .15s;
    }
    .btn-close:hover { background: rgba(255,255,255,.22); }

    /* ── Page ── */
    .page {
      max-width: 860px;
      margin: 28px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
    }

    /* ── Header ── */
    .inv-header {
      background: linear-gradient(135deg, #0a6659 0%, #009179 60%, #00b896 100%);
      padding: 36px 44px 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      position: relative;
      overflow: hidden;
    }
    .inv-header::before {
      content: "";
      position: absolute;
      top: -60px; right: -60px;
      width: 260px; height: 260px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .inv-header::after {
      content: "";
      position: absolute;
      bottom: -80px; right: 80px;
      width: 180px; height: 180px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }
    .school-info { display: flex; align-items: center; gap: 18px; }
    .school-text { color: #fff; }
    .school-name {
      font-family: "DM Serif Display", serif;
      font-size: 22px; font-weight: 400;
      letter-spacing: -0.3px; line-height: 1.2;
    }
    .school-tagline { font-size: 11.5px; opacity: .75; margin-top: 3px; letter-spacing: .5px; }
    .school-contact { font-size: 11px; opacity: .7; margin-top: 10px; line-height: 1.7; }

    .inv-title-block { text-align: right; color: #fff; }
    .inv-label {
      font-size: 11px; font-weight: 600; letter-spacing: 2px;
      text-transform: uppercase; opacity: .7; margin-bottom: 6px;
    }
    .inv-number {
      font-family: "DM Serif Display", serif;
      font-size: 30px; letter-spacing: -0.5px;
    }
    .inv-status-badge {
      display: inline-block;
      margin-top: 10px;
      padding: 5px 16px;
      border-radius: 20px;
      font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      background: ${status.bg}; color: ${status.color};
    }

    /* ── Meta Strip ── */
    .meta-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-bottom: 1px solid #e8edf2;
    }
    .meta-item {
      padding: 18px 24px;
      border-right: 1px solid #e8edf2;
    }
    .meta-item:last-child { border-right: none; }
    .meta-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 5px; }
    .meta-value { font-size: 13.5px; font-weight: 600; color: #1a2332; }

    /* ── Two-column info ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border-bottom: 1px solid #e8edf2;
    }
    .info-block { padding: 24px 32px; }
    .info-block:first-child { border-right: 1px solid #e8edf2; }
    .info-heading {
      font-size: 11px; font-weight: 700; color: #009179;
      text-transform: uppercase; letter-spacing: 1.2px;
      margin-bottom: 14px; display: flex; align-items: center; gap: 6px;
    }
    .info-heading::after {
      content: ""; flex: 1; height: 1px; background: #e2f5f1;
    }
    .info-row { display: flex; flex-direction: column; margin-bottom: 10px; }
    .info-key { font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
    .info-val { font-size: 13.5px; color: #1a2332; font-weight: 500; }

    /* ── Fee Items Table ── */
    .section-heading {
      padding: 16px 24px 10px;
      font-size: 11px; font-weight: 700; color: #009179;
      text-transform: uppercase; letter-spacing: 1.2px;
      border-bottom: 1px solid #e8edf2;
    }
    .fee-table { width: 100%; border-collapse: collapse; }
    .fee-table thead tr { background: #f1f8f6; }
    .fee-table thead th {
      padding: 12px 20px;
      font-size: 11px; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .8px;
      text-align: left; border-bottom: 1px solid #e8edf2;
    }
    .fee-table thead th:last-child { text-align: right; }
    .fee-table tbody tr { border-bottom: 1px solid #f0f4f8; }

    /* ── Totals ── */
    .totals-block {
      display: flex; justify-content: flex-end;
      padding: 20px 32px;
      border-bottom: 1px solid #e8edf2;
      background: #fafcfb;
    }
    .totals-inner { min-width: 280px; }
    .total-row {
      display: flex; justify-content: space-between;
      align-items: center; padding: 6px 0;
      border-bottom: 1px dashed #e8edf2; font-size: 13.5px;
    }
    .total-row:last-child { border-bottom: none; }
    .total-row--grand {
      padding: 10px 0; margin-top: 4px;
      font-size: 16px; font-weight: 700;
    }
    .total-row--grand .total-label { color: #1a2332; }
    .total-row--grand .total-amount { color: #0d7a6b; font-size: 18px; }
    .total-row--remaining .total-amount { color: #dc2626; font-weight: 700; }
    .total-row--paid .total-amount { color: #059669; }
    .total-label { color: #64748b; }
    .total-amount { font-weight: 600; color: #1a2332; }

    /* ── Payment History ── */
    .pay-table { width: 100%; border-collapse: collapse; }
    .pay-table thead tr { background: #f8fafb; }
    .pay-table thead th {
      padding: 10px 16px; font-size: 11px; font-weight: 700;
      color: #64748b; text-transform: uppercase; letter-spacing: .8px;
      text-align: left; border-bottom: 1px solid #e8edf2;
    }
    .pay-table thead th:last-child { text-align: right; }
    .pay-table tbody tr { border-bottom: 1px solid #f0f4f8; }

    /* ── Footer ── */
    .inv-footer {
      background: #f8fafb;
      padding: 20px 32px;
      display: flex; justify-content: space-between; align-items: center;
      border-top: 1px solid #e8edf2;
      gap: 16px; flex-wrap: wrap;
    }
    .footer-note { font-size: 11.5px; color: #94a3b8; line-height: 1.6; max-width: 480px; }
    .footer-stamp {
      text-align: center;
      padding: 14px 28px;
      border: 1.5px dashed #cbd5e1;
      border-radius: 10px;
    }
    .footer-stamp p { font-size: 10.5px; color: #94a3b8; margin-bottom: 22px; }
    .footer-stamp span { font-size: 11px; color: #64748b; font-weight: 500; border-top: 1px solid #cbd5e1; padding-top: 6px; display: block; }

    /* ── Watermark for paid ── */
    ${invoice.status === "paid" ? `
    .page { position: relative; }
    .page::after {
      content: "PAID";
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-family: "DM Serif Display", serif;
      font-size: 120px; font-weight: 400;
      color: rgba(0,145,121,0.06);
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
    }` : ""}

    /* ── Print ── */
    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .page {
        margin: 0;
        border-radius: 0;
        box-shadow: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

<!-- Toolbar -->
<div class="toolbar">
  <span>Invoice ${invoice.invoiceNumber ?? ""} · ${sc.name}</span>
  <div class="toolbar-btns">
    <button class="btn-close" onclick="window.close()">✕ Close</button>
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
  </div>
</div>

<div class="page">

  <!-- Header -->
  <div class="inv-header">
    <div class="school-info">
      ${logoBlock}
      <div class="school-text">
        <div class="school-name">${sc.name}</div>
        <div class="school-tagline">${sc.tagline}</div>
        <div class="school-contact">
          ${sc.address}<br/>
          ${sc.phone} &nbsp;·&nbsp; ${sc.email}<br/>
          ${sc.website}
        </div>
      </div>
    </div>
    <div class="inv-title-block">
      <div class="inv-label">Fee Invoice</div>
      <div class="inv-number">${invoice.invoiceNumber ?? "—"}</div>
      <div class="inv-status-badge">${status.label}</div>
    </div>
  </div>

  <!-- Meta Strip -->
  <div class="meta-strip">
    <div class="meta-item">
      <div class="meta-label">Issue Date</div>
      <div class="meta-value">${fmtDate(invoice.createdAt ?? new Date())}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Due Date</div>
      <div class="meta-value" style="color:${new Date(invoice.dueDate) < new Date() && invoice.status !== "paid" ? "#dc2626" : "#1a2332"}">
        ${fmtDate(invoice.dueDate)}
      </div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Invoice Type</div>
      <div class="meta-value">${typeLabel}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Period</div>
      <div class="meta-value">${invoice.month ? fmtDate(invoice.month) : invoice.year ? `Year ${new Date(invoice.year).getFullYear()}` : "—"}</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <!-- Student -->
    <div class="info-block">
      <div class="info-heading">Bill To</div>
      <div class="info-row">
        <span class="info-key">Student Name</span>
        <span class="info-val">${st.firstName ?? ""} ${st.lastName ?? ""}</span>
      </div>
      <div class="info-row">
        <span class="info-key">Roll Number</span>
        <span class="info-val">${st.rollNumber ?? "—"}</span>
      </div>
      <div class="info-row">
        <span class="info-key">Class</span>
        <span class="info-val">${cl.name ?? "—"}${cl.section ? " · " + cl.section : ""}</span>
      </div>
      ${st.email ? `<div class="info-row"><span class="info-key">Email</span><span class="info-val">${st.email}</span></div>` : ""}
      ${st.phone ? `<div class="info-row"><span class="info-key">Phone</span><span class="info-val">${st.phone}</span></div>` : ""}
    </div>

    <!-- Invoice Details -->
    <div class="info-block">
      <div class="info-heading">Invoice Details</div>
      <div class="info-row">
        <span class="info-key">Title</span>
        <span class="info-val">${invoice.title ?? "—"}</span>
      </div>
      <div class="info-row">
        <span class="info-key">Academic Year</span>
        <span class="info-val">${invoice.academicYear ?? (invoice.year ? new Date(invoice.year).getFullYear() : "—")}</span>
      </div>
      ${invoice.description ? `<div class="info-row"><span class="info-key">Notes</span><span class="info-val">${invoice.description}</span></div>` : ""}
      ${invoice.notes ? `<div class="info-row"><span class="info-key">Additional Notes</span><span class="info-val">${invoice.notes}</span></div>` : ""}
    </div>
  </div>

  <!-- Fee Items -->
  <div class="section-heading">Fee Breakdown</div>
  <table class="fee-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Details</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${feeRows || `<tr><td colspan="3" style="padding:16px 20px;color:#94a3b8;font-size:13px;">No fee items</td></tr>`}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals-block">
    <div class="totals-inner">
      <div class="total-row">
        <span class="total-label">Subtotal</span>
        <span class="total-amount">${fmt(invoice.subtotal ?? invoice.totalAmount)}</span>
      </div>
      ${(invoice.discount && invoice.discount > 0) ? `
      <div class="total-row">
        <span class="total-label">Discount${invoice.discountType === "percentage" ? ` (${invoice.discount}%)` : ""}</span>
        <span class="total-amount" style="color:#059669;">− ${fmt(invoice.discount)}</span>
      </div>` : ""}
      <div class="total-row total-row--grand">
        <span class="total-label">Total Amount</span>
        <span class="total-amount">${fmt(invoice.totalAmount)}</span>
      </div>
      <div class="total-row total-row--paid">
        <span class="total-label">Amount Paid</span>
        <span class="total-amount">${fmt(invoice.paidAmount)}</span>
      </div>
      <div class="total-row total-row--remaining">
        <span class="total-label">Balance Due</span>
        <span class="total-amount">${fmt(remaining)}</span>
      </div>
    </div>
  </div>

  <!-- Payment History -->
  <div class="section-heading">Payment History</div>
  <table class="pay-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Receipt #</th>
        <th>Method</th>
        <th>Reference</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${paymentRows}</tbody>
  </table>

  <!-- Footer -->
  <div class="inv-footer">
    <div class="footer-note">
      This is a computer-generated invoice and does not require a physical signature unless stamped and signed below.
      For queries, contact our accounts department at <strong>${sc.email}</strong> or call <strong>${sc.phone}</strong>.
    </div>
    <div class="footer-stamp">
      <p>Authorised Signature &amp; School Stamp</p>
      <span>Accounts Department — ${sc.name}</span>
    </div>
  </div>

</div>

<script>
  // Auto-focus print dialog hint (optional)
  document.querySelector('.btn-print').addEventListener('click', function() {
    window.print();
  });
</script>
</body>
</html>`;
}

// ─── Main Export: printInvoice() ───────────────────────────────────────────────
export function printInvoice(invoice, payments = []) {
  const html = buildInvoiceHTML(invoice, payments);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ─── Drop-in Button Component ──────────────────────────────────────────────────
/**
 * <InvoicePrintButton invoice={invoice} />
 *
 * If you also have payments loaded, pass them:
 * <InvoicePrintButton invoice={invoice} payments={payments} />
 *
 * The button fetches payment history automatically if apiUrl is provided
 * and payments prop is not given.
 */
export function InvoicePrintButton({ invoice, payments }) {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";

  const handlePrint = async () => {
    let paymentData = payments;

    // Auto-fetch payments if not provided
    if (!paymentData) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/fees/payments?invoiceId=${invoice._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        paymentData = json.data ?? [];
      } catch {
        paymentData = [];
      }
    }

    printInvoice(invoice, paymentData);
  };

  return (
    <button
      onClick={handlePrint}
      title="Print Invoice"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        borderRadius: 6,
        background: "#0d7a6b",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      🖨️ Print
    </button>
  );
}