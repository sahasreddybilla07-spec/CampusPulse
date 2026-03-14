import './Logo.css';

export default function Logo() {
  return (
    <div className="logo-container">
      <svg
        className="logo-svg"
        viewBox="0 0 300 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-deep-navy)" />
            <stop offset="30%" stopColor="var(--color-ocean-blue)" />
            <stop offset="70%" stopColor="var(--color-soft-cyan)" />
            <stop offset="100%" stopColor="var(--color-muted-gold)" />
          </linearGradient>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-soft-cyan)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="var(--color-ocean-blue)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-soft-cyan)" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-ocean-blue)" />
            <stop offset="70%" stopColor="var(--color-soft-cyan)" />
            <stop offset="100%" stopColor="var(--color-deep-navy)" />
          </radialGradient>
        </defs>

        {/* Main pulse wave */}
        <path
          d="M30,60 Q60,30 90,60 T150,60 T210,60 T270,60"
          stroke="url(#waveGradient)"
          strokeWidth="3"
          fill="none"
          className="main-wave"
        />

        {/* Secondary waves */}
        <path
          d="M30,70 Q60,40 90,70 T150,70 T210,70 T270,70"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          className="secondary-wave"
          opacity="0.7"
        />
        <path
          d="M30,50 Q60,20 90,50 T150,50 T210,50 T270,50"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          className="secondary-wave"
          opacity="0.7"
        />

        {/* Campus nodes - representing different campus locations/facilities */}
       <circle cx="40" cy="60" r="8" fill="url(#nodeGradient)" className="campus-node" />
<circle cx="110" cy="60" r="8" fill="url(#nodeGradient)" className="campus-node" />
<circle cx="180" cy="60" r="8" fill="url(#nodeGradient)" className="campus-node" />
<circle cx="250" cy="60" r="8" fill="url(#nodeGradient)" className="campus-node" />

        {/* Communication signals emanating from nodes */}
        <g className="signal-lines">
          <line x1="30" y1="60" x2="45" y2="45" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="30" y1="60" x2="45" y2="75" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="90" y1="60" x2="105" y2="45" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="90" y1="60" x2="105" y2="75" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="150" y1="60" x2="165" y2="45" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="150" y1="60" x2="165" y2="75" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="210" y1="60" x2="225" y2="45" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
          <line x1="210" y1="60" x2="225" y2="75" stroke="var(--color-soft-cyan)" strokeWidth="1.5" opacity="0.8" />
        </g>

        {/* Text */}
           {/* Main Logo Text */}
<text
  x="150"
  y="85"
  textAnchor="middle"
  className="logo-text"
  fill="url(#logoGradient)"
>
  CampusPulse
</text>

{/* Tagline */}
<text
  x="150"
  y="107"
  textAnchor="middle"
  className="logo-tagline"
  fill="white"
>
  CONNECT • REPORT • RESOLVE
</text>
      </svg>
    </div>
  );
}