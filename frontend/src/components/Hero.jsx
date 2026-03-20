import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './Hero.css';

export default function Hero() {
  const [hoverSubmit, setHoverSubmit] = useState(false);
  const [hoverTrack, setHoverTrack] = useState(false);
  const [hoverLogin, setHoverLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="hero">

      <div className="hero-background">
        <img
          src="/placeholder-hero-bg.jpg"
          alt="Campus Background"
          className="hero-image"
        />
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-content">

        <div className="hero-logo-container">
          <Logo />
        </div>

        <p className="hero-subtitle">
          Your Voice for a Better Campus
        </p>

        <div className="hero-buttons">
          <Link
            to="/submit-complaint"
            className={`btn-primary ${hoverSubmit ? 'active' : ''}`}
            onMouseEnter={() => setHoverSubmit(true)}
            onMouseLeave={() => setHoverSubmit(false)}
          >
            <span className="btn-icon">✉</span>
            Submit Complaint
          </Link>

          <Link
            to="/complaints"
            className={`btn-secondary ${hoverTrack ? 'active' : ''}`}
            onMouseEnter={() => setHoverTrack(true)}
            onMouseLeave={() => setHoverTrack(false)}
          >
            <span className="btn-icon">📊</span>
            Track Status
          </Link>

        
        
        </div>

      </div>

    </section>
  );
}