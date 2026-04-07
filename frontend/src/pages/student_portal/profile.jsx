import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { API_URL } from "../../context/AuthContext";
import { useState, useEffect } from 'react';

function Field({ label, value }) {
  return (
    <div className="profile-field">
      <div className="profile-field-label">{label}</div>
      <div className="profile-field-value">{value || <span style={{ color: "var(--text-3)" }}>Not set</span>}</div>
    </div>
  );
}

export default function Profile() {
  const { user: authUser } = useAuth();

  // ── match the same pattern as Courses ──────────────────────────────
  const userString = localStorage.getItem("user");
  const localUser = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!localUser?._id) return;
        const res = await fetch(
          `http://localhost:5000/api/students/${localUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setStudent(data.data ?? null);
      } catch (err) {
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [localUser?._id]);

  // ── these two stay as useFetch since they depend on student data ───
  const { data: classData } = useFetch(
    student?.class ? `/api/classes/${student.class}` : null,
    [student?.class]
  );
  const cls = classData;

  const { data: feeData } = useFetch(
    student?._id ? `/api/fees/students/fee-status?studentId=${student._id}` : null,
    [student?._id]
  );
  const feeSummary = feeData?.data?.summary;

  // ── rest of your existing code unchanged ──────────────────────────
  const initials = student
    ? `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`
    : authUser?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "ST";

  const profilePicUrl = student?.profilePic
    ? `${API_URL.replace("/api", "")}/${student.profilePic}`
    : null;

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius)", marginBottom: "1rem" }}></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
        {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: "var(--radius-sm)" }}></div>)}
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your personal information and academic details.</p>
      </div>

      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar">
          {profilePicUrl ? <img src={profilePicUrl} alt="Profile" /> : initials}
        </div>
        <div className="profile-info">
          <h2>{student ? `${student.firstName} ${student.lastName}` : user?.name || "Student"}</h2>
          <p>
            {cls?.name || "—"}
            {student?.rollNumber ? ` · Roll #${student.rollNumber}` : ""}
            {student?.academicYear ? ` · ${student.academicYear}` : ""}
          </p>
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem", flexWrap: "wrap" }}>
            <span className={`badge ${student?.status === "Active" ? "badge-green" : "badge-red"}`}>
              {student?.status || "Active"}
            </span>
            {student?.feePlan && (
              <span className="badge badge-blue">{student.feePlan} Plan</span>
            )}
            {student?.religion && (
              <span className="badge badge-gray">{student.religion}</span>
            )}
          </div>
        </div>

        {/* Fee summary mini */}
        {feeSummary && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="text-xs">Fee Status</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: feeSummary.pendingAmount > 0 ? "var(--accent-warm)" : "var(--accent-green)" }}>
              PKR {(feeSummary.pendingAmount || 0).toLocaleString()}
            </div>
            <div className="text-xs">{feeSummary.pendingAmount > 0 ? "Outstanding" : "All clear"}</div>
          </div>
        )}
      </div>

      {/* Personal Info */}
      <h2 className="section-title">Personal Information</h2>
      <div className="profile-grid mb-3">
        <Field label="First Name" value={student?.firstName} />
        <Field label="Last Name" value={student?.lastName} />
        <Field label="Email" value={student?.email} />
        <Field label="Phone" value={student?.phone} />
        <Field label="Date of Birth" value={student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : null} />
        <Field label="Gender" value={student?.gender} />
        <Field label="Religion" value={student?.religion} />
        <Field label="Enrollment Date" value={student?.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : null} />
        <Field label="Roll Number" value={student?.rollNumber} />
      </div>

      {/* Academic Info */}
      <h2 className="section-title">Academic Details</h2>
      <div className="profile-grid mb-3">
        <Field label="Class" value={cls?.name} />
        <Field label="Academic Year" value={student?.academicYear} />
        <Field label="Fee Plan" value={student?.feePlan} />
        <Field label="Annual Fee" value={student?.fee ? `PKR ${Number(student.fee).toLocaleString()}` : null} />
      </div>

      {/* Address */}
      {student?.address && Object.values(student.address).some(v => v) && (
        <>
          <h2 className="section-title">Address</h2>
          <div className="profile-grid mb-3">
            <Field label="Street" value={student.address.street} />
            <Field label="City" value={student.address.city} />
            <Field label="State" value={student.address.state} />
            <Field label="Zip Code" value={student.address.zipCode} />
            <Field label="Country" value={student.address.country} />
          </div>
        </>
      )}

      {/* Guardian */}
      {student?.guardian?.name && (
        <>
          <h2 className="section-title">Guardian Information</h2>
          <div className="profile-grid mb-3">
            <Field label="Guardian Name" value={student.guardian.name} />
            <Field label="Guardian Phone" value={student.guardian.phone} />
            <Field label="Guardian Address" value={student.guardian.address} />
          </div>
        </>
      )}

      {/* Fee summary */}
      {feeSummary && (
        <>
          <h2 className="section-title">Fee Overview</h2>
          <div className="profile-grid">
            {[
              ["Total Invoices", feeSummary.totalInvoices],
              ["Paid Invoices", feeSummary.paidInvoices],
              ["Unpaid Invoices", feeSummary.unpaidInvoices],
              ["Overdue", feeSummary.overdueInvoices],
              ["Total Billed", `PKR ${(feeSummary.totalAmount || 0).toLocaleString()}`],
              ["Total Paid", `PKR ${(feeSummary.paidAmount || 0).toLocaleString()}`],
              ["Outstanding", `PKR ${(feeSummary.pendingAmount || 0).toLocaleString()}`],
            ].map(([label, value]) => (
              <Field key={label} label={label} value={String(value ?? "—")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}