import { FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4 className="footer-heading">Department Contacts</h4>
          <div className="contact-list">
            <p>📍 <strong>Maintenance:</strong> <a href="mailto:maintenance@cbit.ac.in">maintenance@cbit.ac.in</a></p>
            <p>🏢 <strong>Hostel:</strong> <a href="mailto:hostel@cbit.ac.in">hostel@cbit.ac.in</a></p>
            <p>💻 <strong>IT Support:</strong> <a href="mailto:itsupport@cbit.ac.in">itsupport@cbit.ac.in</a></p>
            <p>🚌 <strong>Transport:</strong> <a href="mailto:transport@cbit.ac.in">transport@cbit.ac.in</a></p>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Support</h4>
          <p className="support-email">
            📧 <a href="mailto:support@campuspulse.app">support@campuspulse.app</a>
          </p>
          <p className="support-description">Have questions? Our team is here to help.</p>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Connect With Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="GitHub"><FaGithub /></a>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <p className="copyright">
          © 2026 CampusPulse | Built for CBIT Students | Developed by Team CampusPulse
        </p>
      </div>

      <div className="footer-background">
        <div className="footer-glow"></div>
      </div>
    </footer>
  );
}
