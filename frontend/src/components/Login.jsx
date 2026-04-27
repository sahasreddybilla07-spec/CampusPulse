import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Login.css';


/* ── Demo credentials ─────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    role: 'student',
    roleIndex: 0,
    label: 'Student',
    id: 'student@campuspulse.edu',
    password: 'Student@123',
  },
  {
    role: 'incharge',
    roleIndex: 1,
    label: 'In-Charge',
    id: 'incharge@campuspulse.edu',
    password: 'Incharge@123',
  },
  {
    role: 'admin',
    roleIndex: 2,
    label: 'Admin',
    id: 'admin@campuspulse.edu',
    password: 'Admin@123',
  },
];

/* ── Role config ─────────────────────────────────────────── */
const ROLES = [
  {
    id: 'student',
    label: 'Student',
    subtitle: 'Raise & track your complaints',
    idLabel: 'Student ID / Email',
    idPlaceholder: '1601******** or student@college.edu',
    redirectTo: '/student/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: 'incharge',
    label: 'In-Charge',
    subtitle: 'Manage block & floor complaints',
    idLabel: 'Staff ID / Email',
    idPlaceholder: 'e.g. incharge@college.edu',
    redirectTo: '/incharge/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    subtitle: 'Full system administration',
    idLabel: 'Admin ID / Email',
    idPlaceholder: 'e.g. admin@college.edu',
    redirectTo: '/admin/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

/* ── Feature bullet points ────────────────────────────────── */
const FEATURES = [
  'Role-based access for students, in-charges & admins',
  'AI-powered complaint routing & NLP classification',
  'Real-time status tracking and audit logs',
  'Graphical analytics & sentiment analysis',
];

/* ─────────────────────────────────────────────────────────── */

export default function Login() {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const [activeRole, setActiveRole] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const role = ROLES[activeRole];

  const handleRoleChange = (idx) => {
    setActiveRole(idx);
    setIdentifier('');
    setPassword('');
    setAuthError('');
  };

  /* Auto-fill from demo panel */
  const fillDemo = (demo) => {
    setActiveRole(demo.roleIndex);
    setIdentifier(demo.id);
    setPassword(demo.password);
    setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      let email = identifier.trim();

      // ── Check if this is a demo account (client-side only) ──
      const demoMatch = DEMO_ACCOUNTS.find(
        d => d.id === email && d.password === password
      );
      if (demoMatch) {
        // Demo mode — set auth state and navigate
        loginDemo(demoMatch.role);
        navigate(ROLES[demoMatch.roleIndex].redirectTo);
        return;
      }

      // Roll number lookup — if it doesn't look like an email
      if (!email.includes('@')) {
        const { data: profileRow, error: lookupErr } = await supabase
          .from('profiles')
          .select('email')
          .eq('roll_no', email)
          .single();

        if (lookupErr || !profileRow) {
          setAuthError('Roll number not found. Please check and try again.');
          return;
        }
        email = profileRow.email;
      }

      // Sign in with Supabase
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setAuthError('Incorrect password or account not found.');
        return;
      }

      // Verify role matches selected tab
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (prof?.role !== role.id) {
        await supabase.auth.signOut();
        setAuthError(`This account is a "${prof?.role}" account. Please select the correct tab.`);
        return;
      }

      navigate(role.redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="lp-root">

      {/* Animated background */}
      <div className="lp-bg">
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
        <div className="lp-blob lp-blob-3" />
        <div className="lp-grid" />
      </div>

      <div className="lp-layout">

        {/* ── Left info panel ─────────────────────────── */}
        <div className="lp-info-panel">

          {/* Brand */}
          <div className="lp-brand">
            <Logo />
          </div>

          <h1 className="lp-info-headline">
            Your campus.<br />
            <span>Smarter feedback.</span>
          </h1>

          <p className="lp-info-desc">
            A unified portal for students, in-charges, and administrators
            to raise, track, and resolve complaints with AI intelligence.
          </p>

          <ul className="lp-features-list">
            {FEATURES.map((f, i) => (
              <li key={i} className="lp-feature-item">
                <span className="lp-feature-dot">
                  <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>

        </div>

        {/* ── Login card ──────────────────────────────── */}
        <div className="lp-card">

          <div className="lp-card-header">
            <h2 className="lp-card-title">Welcome back 👋</h2>
            <p className="lp-card-sub">Select your role and sign in to continue</p>
          </div>

          {/* Role tabs */}
          <div className="lp-tabs" role="tablist">
            {ROLES.map((r, idx) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={activeRole === idx}
                className={`lp-tab ${activeRole === idx ? 'lp-tab--active' : ''}`}
                onClick={() => handleRoleChange(idx)}
              >
                <span className="lp-tab-icon">{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Role banner */}
          <div className={`lp-role-banner lp-role-banner--${role.id}`} key={role.id}>
            <span className="lp-role-banner-icon">{role.icon}</span>
            <div>
              <p className="lp-role-banner-title">Sign in as {role.label}</p>
              <p className="lp-role-banner-sub">{role.subtitle}</p>
            </div>
          </div>

          {/* Form */}
          {authError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
              padding: '0.7rem 1rem', marginBottom: '0.75rem',
              color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              ⚠️ {authError}
            </div>
          )}
          <form className="lp-form" onSubmit={handleSubmit} noValidate>

            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-id">{role.idLabel}</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon lp-input-icon--left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="lp-id"
                  type="text"
                  className="lp-input"
                  placeholder={role.idPlaceholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="lp-field">
              <div className="lp-label-row">
                <label className="lp-label" htmlFor="lp-password">Password</label>
                <a href="#" className="lp-forgot">Forgot password?</a>
              </div>
              <div className="lp-input-wrap">
                <span className="lp-input-icon lp-input-icon--left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="lp-password"
                  type={showPassword ? 'text' : 'password'}
                  className="lp-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-input-icon lp-input-icon--right lp-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="lp-options">
              <label className="lp-remember">
                <input
                  type="checkbox"
                  className="lp-remember-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="lp-remember-box" />
                <span>Remember me</span>
              </label>
            </div>

            <button
              id="lp-submit"
              type="submit"
              className={`lp-btn lp-btn--${role.id}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="lp-spinner" />
              ) : (
                <>
                  <span>Sign in as {role.label}</span>
                  <svg className="lp-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Create account link (students only) */}
          {activeRole === 0 && (
            <p className="lp-footer-text">
              New student?{' '}
              <Link to="/student/register" className="lp-footer-link">Create an account</Link>
            </p>
          )}

          {/* Demo accounts */}
          <div className="lp-demo">
            <p className="lp-demo-label">Demo Accounts</p>
            <div className="lp-demo-accounts">
              {DEMO_ACCOUNTS.map((demo) => (
                <div key={demo.role} className="lp-demo-account" onClick={() => fillDemo(demo)}>
                  <span className={`lp-demo-role-badge lp-demo-role-badge--${demo.role}`}>
                    {demo.label}
                  </span>
                  <div className="lp-demo-creds">
                    <span className="lp-demo-id">{demo.id}</span>
                    <span className="lp-demo-pass">Password: {demo.password}</span>
                  </div>
                  <button type="button" className="lp-demo-fill-btn">
                    Use ↗
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="lp-badges">
            <span className="lp-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SSL Secure
            </span>
            <span className="lp-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Role-Based Access
            </span>
            <span className="lp-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              GDPR Compliant
            </span>
          </div>

        </div>
        {/* end lp-card */}

      </div>
      {/* end lp-layout */}

    </div>
  );
}