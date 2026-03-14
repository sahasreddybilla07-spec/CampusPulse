import { useState } from 'react';
import Logo from './Logo';
import './Hero.css';

export default function Hero() {
  const [hoverSubmit, setHoverSubmit] = useState(false);
  const [hoverTrack, setHoverTrack] = useState(false);

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
          <button
            className={`btn-primary ${hoverSubmit ? 'active' : ''}`}
            onMouseEnter={() => setHoverSubmit(true)}
            onMouseLeave={() => setHoverSubmit(false)}
          >
            <span className="btn-icon">✉</span>
            Submit Complaint
          </button>

          <button
            className={`btn-secondary ${hoverTrack ? 'active' : ''}`}
            onMouseEnter={() => setHoverTrack(true)}
            onMouseLeave={() => setHoverTrack(false)}
          >
            <span className="btn-icon">📊</span>
            Track Status
          </button>
        </div>

      </div>

    </section>
  );
}