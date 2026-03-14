import './Navbar.css';

export default function Navbar() {
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
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Submit Complaint</a>
          <a href="#" className="nav-link">Track Status</a>
          <a href="#" className="nav-link">Analytics</a>
          <a href="#" className="nav-link login-link">Login</a>
        </div>

      </div>

    </nav>
  );
}