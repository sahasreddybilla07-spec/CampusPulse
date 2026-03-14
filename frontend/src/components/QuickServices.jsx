import './QuickServices.css';

const ServiceCard = ({ icon, title, description }) => {
  return (
    <div className="service-card">
      <div className="service-icon">{icon}</div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
    </div>
  );
};

export default function QuickServices() {

  const services = [
    {
      icon: '📊',
      title: 'View Analytics',
      description: 'Explore detailed insights and statistics about campus complaints and resolutions.'
    },
    {
      icon: '📞',
      title: 'Department Contacts',
      description: 'Find contact information for all campus departments and services.'
    },
    {
      icon: '🔐',
      title: 'Admin Login',
      description: 'Access administrative features and manage complaint resolutions.'
    },
    {
      icon: 'ℹ️',
      title: 'About CampusPulse',
      description: 'Learn more about our mission to improve campus communication.'
    }
  ];

  return (
    <section className="quick-services">

      <div className="services-container">

        <div className="services-header">
          <h2 className="services-title">Quick Services</h2>
          <p className="services-subtitle">
            Access key features and information at your fingertips
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

      </div>

    </section>
  );
}