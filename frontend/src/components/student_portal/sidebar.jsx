import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV = [
  {
    section: "Main",
    items: [
      { id: "dashboard",  icon: "⊞",  label: "Dashboard" },
      { id: "fees",       icon: "₨",  label: "Fee Invoices" },
      { id: "attendance",       icon: "✦",  label: "Attendance" },
    ],
  },
  {
    section: "Academics",
    items: [
      { id: "courses",    icon: "◈",  label: "My Courses" },
      { id: "timetable",  icon: "◷",  label: "Timetable" },
      { id: "diary",      icon: "✦",  label: "Diary & Material" },
    ],
  },
  {
    section: "Account",
    items: [
      { id: "profile",    icon: "◉",  label: "My Profile" },
    ],
  },
];

export default function Student_Sidebar({ activePage, isOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "ST";

  return (
    <aside  className={`sidebar`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div className="logo-text">
          <span className="logo-title">EduPortal</span>
          <span className="logo-sub">Student</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div className="nav-section" key={group.section}>
            <div className="nav-label">{group.section}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip" onClick={() => navigate("profile")}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || "Student"}</div>
            <div className="user-role">Student Portal</div>
          </div>
        </div>
      </div>
    </aside>
  );
}