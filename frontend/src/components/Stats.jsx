import { useEffect, useRef, useState } from 'react';
import { FaRegClipboard, FaCheckCircle, FaClock } from 'react-icons/fa';
import './Stats.css';

const StatCard = ({ icon, value, label, isVisible }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, numericValue]);

  return (
    <div className="stat-card" data-aos="fade-up">
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">
        {count}
        <span className="stat-suffix">+</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats" ref={statsRef}>
      <div className="stats-container">
        <h2 className="stats-title" data-aos="fade-down">
          Impact at a Glance
        </h2>

        <div className="stats-grid">
          <StatCard
            icon={<FaRegClipboard />}
            value="1200"
            label="Complaints Submitted"
            isVisible={isVisible}
          />
          <StatCard
            icon={<FaCheckCircle />}
            value="1100"
            label="Complaints Resolved"
            isVisible={isVisible}
          />
          <StatCard
            icon={<FaClock />}
            value="2"
            label="Avg Resolution Time (Days)"
            isVisible={isVisible}
          />
        </div>
      </div>

      <div className="stats-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </section>
  );
}
