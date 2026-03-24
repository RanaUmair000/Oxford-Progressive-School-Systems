import React, { useState, useEffect, useRef } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

// ─── Inline keyframe styles ───────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #3C50E0;
    --secondary: #80CAEE;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --info: #6366F1;
    --white: #FFFFFF;
    --black: #1C2434;
    --gray: #EFF4FB;
    --gray-2: #F7F9FC;
    --gray-3: #E2E8F0;
    --stroke: #E2E8F0;
    --boxdark: #24303F;
    --boxdark-2: #1A222C;
    --strokedark: #2E3A47;
    --meta-4: #313D4A;
  }

  .sidebar-header{
  display: none;
  }

  body { background: var(--boxdark-2); font-family: 'DM Sans', sans-serif; }

  @keyframes floatUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50%       { opacity: 0.8; transform: scale(1.05); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
  @keyframes dash {
    to { stroke-dashoffset: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes slideRight {
    from { transform: translateX(-20px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .login-root {
    min-height: 100vh;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* ── LEFT PANEL ─────────────────────────────────── */
  .left-panel {
    width: 52%;
    min-height: 100vh;
    background: var(--boxdark-2);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
  }

  .left-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 80%, rgba(60,80,224,.25) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 85% 15%, rgba(128,202,238,.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .panel-logo {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 14px;
    animation: floatUp .6s ease both;
  }

  .logo-mark {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    box-shadow: 0 0 0 6px rgba(60,80,224,.15);
  }

  .logo-text { display: flex; flex-direction: column; }
  .logo-name { font-family: 'DM Serif Display', serif; font-size: 22px; color: #fff; line-height: 1; }
  .logo-sub  { font-size: 11px; color: var(--secondary); letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; }

  /* ── FLOATING HEXAGONS ───────────────────────────── */
  .hex-field {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .hex {
    position: absolute;
    border: 1.5px solid rgba(128,202,238,.15);
    animation: pulse 4s ease-in-out infinite;
  }

  /* ── CENTER ILLUSTRATION ─────────────────────────── */
  .illustration {
    position: relative; z-index: 2;
    flex: 1; display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 40px 0;
    animation: floatUp .8s .2s ease both;
  }

  .illus-tag {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    background: rgba(128,202,238,.12);
    border: 1px solid rgba(128,202,238,.2);
    color: var(--secondary); font-size: 12px; font-weight: 500;
    letter-spacing: .5px;
    margin-bottom: 24px;
  }
  .illus-tag span { width: 6px; height: 6px; border-radius: 50%; background: var(--secondary); animation: blink 1.4s infinite; }

  .illus-headline {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(36px, 4vw, 52px);
    color: #fff;
    line-height: 1.1;
    margin-bottom: 18px;
  }
  .illus-headline em {
    font-style: italic;
    background: linear-gradient(90deg, var(--secondary), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .illus-body {
    font-size: 15px; color: rgba(255,255,255,.5); line-height: 1.7;
    max-width: 380px; margin-bottom: 36px;
  }

  /* ── STATS ROW ───────────────────────────────────── */
  .stats-row {
    display: flex; gap: 0;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(8px);
    background: rgba(255,255,255,.03);
  }

  .stat-item {
    flex: 1; padding: 18px 20px;
    border-right: 1px solid rgba(255,255,255,.06);
  }
  .stat-item:last-child { border-right: none; }
  .stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 26px; color: #fff; line-height: 1;
    margin-bottom: 4px;
  }
  .stat-lbl { font-size: 11px; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: 1px; }

  /* ── ROLE PILLS BOTTOM ───────────────────────────── */
  .panel-footer {
    position: relative; z-index: 2;
    animation: floatUp .8s .5s ease both;
  }
  .footer-roles {
    display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;
  }
  .role-chip {
    padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 500;
    letter-spacing: .3px;
  }

  /* ── RIGHT PANEL ─────────────────────────────────── */
  .right-panel {
    width: 48%;
    min-height: 100vh;
    background: var(--gray-2);
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px;
    position: relative;
    animation: fadeIn .5s ease both;
  }

  .right-panel::before {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 1px; height: 100%;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(60,80,224,.3) 30%,
      rgba(128,202,238,.3) 70%,
      transparent
    );
  }

  .form-card {
    width: 100%; max-width: 420px;
  }

  .form-header { margin-bottom: 36px; }
  .form-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--primary); margin-bottom: 10px;
    animation: slideRight .5s .1s ease both;
    opacity: 0;
    animation-fill-mode: both;
  }
  .form-title {
    font-family: 'DM Serif Display', serif;
    font-size: 34px; color: var(--black); line-height: 1.1;
    animation: floatUp .5s .2s ease both; opacity: 0;
    animation-fill-mode: both;
  }
  .form-subtitle {
    margin-top: 8px; font-size: 14px; color: #64748b;
    animation: floatUp .5s .3s ease both; opacity: 0;
    animation-fill-mode: both;
  }

  /* ── ROLE SELECTOR ───────────────────────────────── */
  .role-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-bottom: 28px;
    animation: floatUp .5s .35s ease both; opacity: 0;
    animation-fill-mode: both;
  }
  .role-btn {
    padding: 14px 12px; border-radius: 12px;
    border: 2px solid var(--stroke);
    background: #fff; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    transition: all .2s;
    position: relative; overflow: hidden;
  }
  .role-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--primary), var(--info));
    opacity: 0; transition: opacity .2s;
  }
  .role-btn:hover::before { opacity: 0.04; }
  .role-btn.active {
    border-color: var(--primary);
    background: linear-gradient(135deg, rgba(60,80,224,.06), rgba(99,102,241,.04));
    box-shadow: 0 0 0 3px rgba(60,80,224,.12);
  }
  .role-btn.active .role-btn-icon { filter: none; }
  .role-btn-icon { font-size: 22px; filter: grayscale(30%); }
  .role-btn-label {
    font-size: 12px; font-weight: 600; color: #64748b;
    position: relative; z-index: 1; transition: color .2s;
  }
  .role-btn.active .role-btn-label { color: var(--primary); }
  .role-check {
    position: absolute; top: 6px; right: 8px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--primary); display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: #fff;
    animation: scaleIn .2s ease both;
  }

  /* ── INPUT GROUP ─────────────────────────────────── */
  .field-group {
    display: flex; flex-direction: column; gap: 16px;
    margin-bottom: 24px;
    animation: floatUp .5s .45s ease both; opacity: 0;
    animation-fill-mode: both;
  }
  .field-wrap { position: relative; }
  .field-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 7px;
  }
  .field-inner {
    position: relative; display: flex; align-items: center;
  }
  .field-icon {
    position: absolute; left: 14px;
    color: #94a3b8; font-size: 16px; z-index: 1;
    transition: color .2s;
    pointer-events: none;
  }
  .field-input {
    width: 100%; padding: 13px 14px 13px 44px;
    border: 2px solid var(--stroke); border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--black);
    background: #fff; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .field-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(60,80,224,.1);
  }
  .field-input:focus + .field-icon-right,
  .field-wrap:focus-within .field-icon { color: var(--primary); }

  .field-icon-right {
    position: absolute; right: 14px;
    color: #94a3b8; font-size: 14px; cursor: pointer;
    transition: color .2s; z-index: 1;
  }
  .field-icon-right:hover { color: var(--primary); }

  /* ── ERROR ───────────────────────────────────────── */
  .error-box {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 10px;
    background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
    color: var(--danger); font-size: 13px; font-weight: 500;
    margin-bottom: 18px;
    animation: scaleIn .25s ease both;
  }

  /* ── SUBMIT BTN ──────────────────────────────────── */
  .submit-btn {
    width: 100%; padding: 15px;
    border: none; border-radius: 12px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: .3px;
    color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(135deg, var(--primary) 0%, var(--info) 100%);
    transition: transform .15s, box-shadow .2s;
    animation: floatUp .5s .5s ease both; opacity: 0;
    animation-fill-mode: both;
  }
  .submit-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg,
      transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s linear infinite;
  }
  .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(60,80,224,.35); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }

  .spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff; border-radius: 50%;
    animation: rotateSlow .6s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }

  /* ── DEMO CREDS ──────────────────────────────────── */
  .demo-box {
    margin-top: 24px; padding: 16px;
    border-radius: 12px; background: #fff;
    border: 1px dashed var(--stroke);
    animation: floatUp .5s .6s ease both; opacity: 0;
    animation-fill-mode: both;
  }
  .demo-label {
    font-size: 10px; font-weight: 700; color: #94a3b8;
    letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;
  }
  .demo-creds { display: flex; flex-direction: column; gap: 6px; }
  .demo-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px;
  }
  .demo-role { color: #64748b; font-weight: 500; }
  .demo-vals {
    display: flex; gap: 6px;
  }
  .demo-tag {
    padding: 2px 8px; border-radius: 4px;
    background: var(--gray); color: var(--black);
    font-family: monospace; font-size: 11px;
    cursor: pointer; transition: background .15s;
  }
  .demo-tag:hover { background: var(--gray-3); }

  /* ── SUCCESS OVERLAY ─────────────────────────────── */
  .success-overlay {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--gray-2); z-index: 20;
    animation: fadeIn .3s ease both;
    border-radius: inherit;
  }
  .success-ring {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, var(--success), #34D399);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    box-shadow: 0 0 0 12px rgba(16,185,129,.12);
    animation: scaleIn .4s .1s ease both; opacity: 0;
    animation-fill-mode: both;
    margin-bottom: 20px;
  }
  .success-text {
    font-family: 'DM Serif Display', serif;
    font-size: 26px; color: var(--black); margin-bottom: 6px;
    animation: floatUp .4s .2s ease both; opacity: 0;
    animation-fill-mode: both;
  }
  .success-sub {
    font-size: 14px; color: #64748b;
    animation: floatUp .4s .3s ease both; opacity: 0;
    animation-fill-mode: both;
  }

  /* ── RESPONSIVE ──────────────────────────────────── */
  @media (max-width: 768px) {
    .login-root { flex-direction: column; }
    .left-panel  { width: 100%; min-height: auto; padding: 32px 24px; }
    .right-panel { width: 100%; min-height: auto; padding: 32px 20px; }
    .illustration { padding: 20px 0; }
    .illus-headline { font-size: 30px; }
    .stats-row { display: none; }
    .right-panel::before { display: none; }
  }
`;

const ROLES = [
  { id: 'admin', label: 'Admin', icon: '🛡️', color: '#3C50E0' },
  { id: 'teacher', label: 'Teacher', icon: '🎓', color: '#10B981' },
  { id: 'accountant', label: 'Accountant', icon: '📊', color: '#F59E0B' },
  { id: 'student', label: 'Student', icon: '📚', color: '#6366F1' },
];

const DEMO_CREDS = [
  { role: 'admin', username: 'admin', password: 'admin123' },
  { role: 'teacher', username: 'teacher01', password: 'teacher123' },
  { role: 'accountant', username: 'accountant', password: 'acc123' },
  { role: 'student', username: 'student01', password: 'student123' },
];

// Animated hexagons config
const HEXAGONS = [
  { top: '10%', left: '8%', size: 80, delay: '0s' },
  { top: '25%', left: '70%', size: 50, delay: '1s' },
  { top: '55%', left: '15%', size: 110, delay: '0.5s' },
  { top: '70%', left: '60%', size: 65, delay: '1.5s' },
  { top: '80%', left: '5%', size: 40, delay: '2s' },
  { top: '5%', left: '50%', size: 90, delay: '0.8s' },
];

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Typing animation for headline
  const phrases = ['Empower', 'Inspire', 'Connect'];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const target = phrases[phraseIdx];
    if (typing) {
      if (displayed.length < target.length) {
        timeoutRef.current = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 90);
      } else {
        timeoutRef.current = setTimeout(() => setTyping(false), 1600);
      }
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 50);
      } else {
        setPhraseIdx((phraseIdx + 1) % phrases.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [displayed, typing, phraseIdx]);

  const fillDemo = (cred) => {
    setRole(cred.role);
    setUsername(cred.username);
    setPassword(cred.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return setError('Please select a role to continue.');
    if (!username.trim()) return setError('Username is required.');
    if (!password) return setError('Password is required.');

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${apiUrl}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password, role }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Persist auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

      setSuccess(data);

      // Redirect after animation
      setTimeout(() => {
        window.location.href = data.redirect || '/dashboard';
      }, 1600);

    } catch (err) {
      setError('Unable to connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <style>{STYLES}</style>
      <div className="login-root">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div className="left-panel">
          <div className="grid-overlay" />

          {/* Floating hexagons */}
          <div className="hex-field">
            {HEXAGONS.map((h, i) => (
              <div key={i} className="hex" style={{
                top: h.top, left: h.left,
                width: h.size, height: h.size,
                borderRadius: '30%',
                animationDelay: h.delay,
                animationDuration: `${3 + i * 0.7}s`,
              }} />
            ))}
          </div>

          {/* Logo */}
          <div className="panel-logo">
            <div className="logo-mark">🏫</div>
            <div className="logo-text">
              <div className="logo-name">SchoolMS</div>
              <div className="logo-sub">Management System</div>
            </div>
          </div>

          {/* Illustration */}
          <div className="illustration">
            <div className="illus-tag">
              <span />
              Academic Year 2024–2025
            </div>

            <h1 className="illus-headline">
              <em>{displayed}<span style={{ animation: 'blink 1s infinite', color: '#80CAEE' }}>|</span></em>
              <br />Every Mind,<br />Every Day.
            </h1>

            <p className="illus-body">
              Your all-in-one school management platform for teachers, students,
              administrators and staff. Seamlessly manage classes, attendance,
              results and more.
            </p>

            <div className="stats-row">
              {[
                { num: '1,240', lbl: 'Students' },
                { num: '84', lbl: 'Teachers' },
                { num: '32', lbl: 'Classes' },
              ].map(s => (
                <div key={s.lbl} className="stat-item">
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <div style={{ color: 'rgba(255,255,255,.25)', fontSize: 11, letterSpacing: 1 }}>
              ROLE-BASED ACCESS
            </div>
            <div className="footer-roles">
              {ROLES.map(r => (
                <span key={r.id} className="role-chip" style={{
                  background: `${r.color}20`,
                  color: r.color,
                  border: `1px solid ${r.color}30`
                }}>
                  {r.icon} {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="right-panel">
          <div className="form-card" style={{ position: 'relative' }}>

            {/* Success overlay */}
            {success && (
              <div className="success-overlay">
                <div className="success-ring">✓</div>
                <div className="success-text">Welcome back!</div>
                <div className="success-sub">
                  Redirecting to {success.user.role} portal…
                </div>
              </div>
            )}

            {/* Header */}
            <div className="form-header">
              <div className="form-eyebrow">Secure Access Portal</div>
              <h2 className="form-title">Sign in to<br />your account</h2>
              <p className="form-subtitle">
                Select your role and enter credentials to continue.
              </p>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', animation: 'slideRight .5s .3s ease both', opacity: 0, animationFillMode: 'both' }}>
              I AM A
            </div>
            <div className="role-grid">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-btn ${role === r.id ? 'active' : ''}`}
                  onClick={() => { setRole(r.id); setError(''); }}
                >
                  {role === r.id && <div className="role-check">✓</div>}
                  <div className="role-btn-icon">{r.icon}</div>
                  <div className="role-btn-label">{r.label}</div>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                {/* Username */}
                <div className="field-wrap">
                  <label className="field-label">Username</label>
                  <div className="field-inner">
                    <div className="field-icon">👤</div>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
                      autoComplete="username"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field-wrap">
                  <label className="field-label">Password</label>
                  <div className="field-inner">
                    <div className="field-icon">🔒</div>
                    <input
                      className="field-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      autoComplete="current-password"
                      style={{ paddingRight: 44 }}
                    />
                    <div className="field-icon-right" onClick={() => setShowPass(!showPass)}>
                      {showPass ? '🙈' : '👁️'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-box">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !!success}
              >
                {loading
                  ? <><span className="spinner" /> Verifying…</>
                  : <>Sign In as {ROLES.find(r => r.id === role)?.label || 'User'} →</>
                }
              </button>
            </form>

            {/* Demo credentials */}
            <div className="demo-box">
              <div className="demo-label">🔑 Demo Credentials — Click to fill</div>
              <div className="demo-creds">
                {DEMO_CREDS.map(c => (
                  <div key={c.role} className="demo-row" onClick={() => fillDemo(c)} style={{ cursor: 'pointer', padding: '3px 0' }}>
                    <span className="demo-role">
                      {ROLES.find(r => r.id === c.role)?.icon} {c.role.charAt(0).toUpperCase() + c.role.slice(1)}
                    </span>
                    <div className="demo-vals">
                      <span className="demo-tag">{c.username}</span>
                      <span className="demo-tag">{c.password}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <p style={{
              marginTop: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8',
              animation: 'floatUp .5s .7s ease both', opacity: 0, animationFillMode: 'both'
            }}>
              Trouble logging in? Contact your system administrator.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
