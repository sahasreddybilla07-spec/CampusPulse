import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isLoginPage = ['/student/login', '/user/login', '/login'].includes(location.pathname);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Close dropdown when navigating.
    setLoginOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img
            src="/placeholder-cbit-logo.png"
            alt="CBIT Logo"
            className="cbit-logo"
          />
        </div>

        <div className="navbar-menu">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/complaints" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Complaints</NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Analytics</NavLink>

          <div className="nav-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`nav-link login-link ${isLoginPage ? 'active' : ''}`}
              onClick={() => setLoginOpen((prev) => !prev)}
            >
              Login
            </button>

            {loginOpen && (
              <div className="login-dropdown">
                <NavLink to="/student/login" className="dropdown-item" onClick={() => setLoginOpen(false)}>
                  Student
                </NavLink>
                <NavLink to="/user/login" className="dropdown-item" onClick={() => setLoginOpen(false)}>
                  User
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
