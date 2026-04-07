import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  fees: "Fee Invoices",
  invoice: "Invoice Detail",
  courses: "My Courses",
  timetable: "Timetable",
  diary: "Diary & Study Material",
  profile: "My Profile",
};

export default function Topbar({ onMenuToggle, activePage }) {
  const { logout } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuToggle}>☰</button>
      <h2 className="topbar-title">{PAGE_TITLES[activePage] || "Portal"}</h2>
      <span className="topbar-time">{dateStr} · {timeStr}</span>
      <button className="topbar-logout" onClick={logout}>Logout</button>
    </header>
  );
}