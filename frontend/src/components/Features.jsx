import './Features.css';
import { FaBrain, FaClock, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <div className="feature-card" data-aos="zoom-in" data-aos-delay={delay}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <div className="feature-glow"></div>
    </div>
  );
};

export default function Features() {

  const features = [
    {
      icon: <FaBrain />,
      title: 'Smart Complaint Categorization',
      description:
        'AI-powered system automatically categorizes complaints for efficient routing and faster resolution.'
    },
    {
      icon: <FaClock />,
      title: 'Real-Time Status Tracking',
      description:
        'Monitor complaint progress in real-time with instant updates and detailed status information.'
    },
    {
      icon: <FaChartLine />,
      title: 'Data-Driven Insights',
      description:
        'Comprehensive analytics provide valuable insights to improve campus services and operations.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Role-Based Access',
      description:
        'Secure access control ensures appropriate permissions for students, staff, and administrators.'
    }
  ];

  return (
    <section className="features">

      <div className="features-container">

        <div className="features-header" data-aos="fade-down">
          <h2 className="features-title">Features We Provide</h2>
          <p className="features-subtitle">
            Everything you need to make your voice heard
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
              delay={index * 100}
            />
          ))}
        </div>

      </div>

    </section>
  );
}