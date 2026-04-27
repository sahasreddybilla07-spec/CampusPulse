import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { supabase } from '../lib/supabase';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', rollNo: '', email: '', branch: '', year: '', password: '', confirmPassword: ''
  });
  const [showPwd, setShowPwd]    = useState(false);
  const [showCPwd, setShowCPwd]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!form.rollNo.trim()) { setError('Roll number is required.'); return; }

    setIsLoading(true);
    try {
      // 1. Create auth user — trigger auto-creates profile row
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name:         form.fullName,
            role:         'student',
            roll_no:      form.rollNo.trim(),
            password_ref: form.password,
          }
        }
      });
      if (signUpErr) throw signUpErr;

      // 2. Update additional profile fields
      if (authData.user) {
        await supabase.from('profiles').update({
          branch: form.branch,
          year:   form.year,
          name:   form.fullName,
        }).eq('id', authData.user.id);
      }

      setSuccess(true);
      setTimeout(() => navigate('/student/login'), 2500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const FEATURES = [
    { icon: '📋', text: 'Raise complaints anonymously or as yourself' },
    { icon: '🔔', text: 'Get real-time updates on your complaint status' },
    { icon: '📊', text: 'View campus-wide analytics and trends' },
    { icon: '🤖', text: 'AI-powered complaint routing to the right in-charge' },
  ];

  const EyeIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      {open
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  return (
    <div className="sp-root">

      {/* ── Left panel ─────────────────────────── */}
      <div className="sp-left">
        <div className="sp-left-inner">

          {/* Logo */}
          <div className="sp-logo">
            <Logo />
          </div>

          <h2 className="sp-left-headline">
            Join the campus<br />
            <span>community.</span>
          </h2>
          <p className="sp-left-desc">
            Create your free account and start raising, tracking, and resolving
            campus issues — all in one place.
          </p>

          <ul className="sp-features">
            {FEATURES.map((f, i) => (
              <li key={i} className="sp-feature-item">
                <span className="sp-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <p className="sp-left-signin">
            Already have an account?{' '}
            <Link to="/student/login" className="sp-left-link">Sign in →</Link>
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────── */}
      <div className="sp-right">
        <div className="sp-form-card">

          <div className="sp-form-header">
            <h1 className="sp-form-title">Create Account</h1>
            <p className="sp-form-sub">Student Registration — CampusPulse</p>
          </div>

          {success && (
            <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'8px', padding:'0.85rem 1rem', marginBottom:'1rem', color:'#065f46', fontSize:'0.9rem', textAlign:'center' }}>
              ✅ Account created! Redirecting to login…
            </div>
          )}

          {error && <div className="sp-error">{error}</div>}

          <form className="sp-form" onSubmit={handleSubmit}>

            {/* Row: Full Name + Roll No */}
            <div className="sp-row">
              <div className="sp-field">
                <label>Full Name</label>
                <div className="sp-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" placeholder="e.g. Rahul Sharma" value={form.fullName} onChange={set('fullName')} required autoComplete="name" />
                </div>
              </div>
              <div className="sp-field">
                <label>Roll Number</label>
                <div className="sp-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  <input type="text" placeholder="1601********" value={form.rollNo} onChange={set('rollNo')} required autoComplete="off" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="sp-field">
              <label>College Email</label>
              <div className="sp-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" placeholder="e.g. rahul@campuspulse.edu" value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
            </div>

            {/* Row: Branch + Year */}
            <div className="sp-row">
              <div className="sp-field">
                <label>Branch</label>
                <div className="sp-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
                  <select value={form.branch} onChange={set('branch')} required>
                    <option value="">Select branch</option>
                    <option>CSE</option><option>ECE</option><option>EEE</option>
                    <option>MECH</option><option>CIVIL</option><option>IT</option>
                    <option>AIDS</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="sp-field">
                <label>Year</label>
                <div className="sp-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <select value={form.year} onChange={set('year')} required>
                    <option value="">Select year</option>
                    <option>1st Year</option><option>2nd Year</option>
                    <option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="sp-field">
              <label>Password</label>
              <div className="sp-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
                <button type="button" className="sp-eye" onClick={() => setShowPwd(v => !v)}>
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="sp-field">
              <label>Confirm Password</label>
              <div className="sp-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showCPwd ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirmPassword} onChange={set('confirmPassword')} required autoComplete="new-password" />
                <button type="button" className="sp-eye" onClick={() => setShowCPwd(v => !v)}>
                  <EyeIcon open={showCPwd} />
                </button>
              </div>
            </div>

            <button type="submit" className="sp-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <><span className="sp-spinner" /> Creating Account…</>
              ) : (
                '🎓 Create My Account'
              )}
            </button>

            <p className="sp-terms">
              By registering, you agree to CampusPulse's{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}