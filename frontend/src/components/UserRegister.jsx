import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Navbar from './Navbar';
import './Signup.css';

export default function UserRegister() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [organizationFocused, setOrganizationFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      // Handle signup logic here
    }, 2000);
  };

  return (
    <div className="signup-page">
      <Navbar />

      {/* Animated Background */}
      <div className="signup-bg">
        <div className="animated-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Signup Card */}
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-logo">
              <Logo />
            </div>
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-subtitle">Join CampusPulse and get started</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <div className={`input-wrapper ${fullNameFocused ? 'focused' : ''}`}>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFullNameFocused(true)}
                  onBlur={() => setFullNameFocused(false)}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
                <div className="input-icon">👤</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className={`input-wrapper ${emailFocused ? 'focused' : ''}`}>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
                <div className="input-icon">✉</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="organization" className="form-label">Organization / Department</label>
              <div className={`input-wrapper ${organizationFocused ? 'focused' : ''}`}>
                <input
                  type="text"
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  onFocus={() => setOrganizationFocused(true)}
                  onBlur={() => setOrganizationFocused(false)}
                  className="form-input"
                  placeholder="Enter your organization or department"
                  required
                />
                <div className="input-icon">🏢</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className={`input-wrapper ${passwordFocused ? 'focused' : ''}`}>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <div className="input-icon">🔒</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className={`input-wrapper ${confirmPasswordFocused ? 'focused' : ''}`}>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
                <div className="input-icon">🔒</div>
              </div>
            </div>

            <button
              type="submit"
              className={`signup-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p className="signin-text">
              Already have an account?
              <Link to="/user/login" className="signin-link"> Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
