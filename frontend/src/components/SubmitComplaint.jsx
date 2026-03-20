import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './SubmitComplaint.css';

export default function SubmitComplaint() {
  

  const navigate = useNavigate();

  // TODO: re-enable auth guard once login flow is complete
  /*
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  */

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    block: '',
    description: '',
    image: null
  });

  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { id: 'hostel', label: 'Hostel', icon: '🏠' },
    { id: 'academics', label: 'Academics', icon: '📚' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { id: 'others', label: 'Others', icon: '📋', fullWidth: true }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setFormData({
        title: '',
        category: '',
        block: '',
        description: '',
        image: null
      });

      setTimeout(() => setShowSuccess(false), 3000);

    }, 2000);
  };

  return (
    <div className="submit-complaint-page">

      <Navbar />

      {/* Animated Background */}

      <div className="complaint-bg">

        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-7"></div>
          <div className="shape shape-8"></div>
          <div className="shape shape-9"></div>
        </div>

        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="particles">
          {[...Array(25)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>

      </div>

      {/* Main Content */}

      <div className="complaint-container">

        <div className="complaint-card">

          <div className="complaint-header">
            <h1 className="complaint-title">Got an Issue? Let's Fix It 🚀</h1>
            <p className="complaint-subtitle">
              Spotted something broken or annoying? Drop it here and we'll handle it.
            </p>
          </div>

          <form className="complaint-form" onSubmit={handleSubmit}>

            {/* Title */}

            <div className="form-group">
              <label className="form-label">Complaint Title</label>

              <div className={`input-wrapper ${focusedField === 'title' ? 'focused' : ''}`}>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField('')}
                  className="form-input"
                  placeholder="Give your issue a quick headline…"
                  required
                />
                <div className="input-icon">📝</div>
              </div>
            </div>

            {/* Category Selection */}

            <div className="form-group">

              <label className="form-label">Category</label>

              <div className="category-container">

                <div className="category-grid">

                  {categories
                    .filter(cat => !cat.fullWidth)
                    .map(cat => (

                      <label
                        key={cat.id}
                        className={`category-card ${formData.category === cat.id ? 'selected' : ''}`}
                      >

                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={formData.category === cat.id}
                          onChange={handleInputChange}
                          className="category-radio"
                        />

                        <div className="category-icon">{cat.icon}</div>
                        <div className="category-label">{cat.label}</div>

                      </label>

                    ))}

                </div>

                <div className="category-fullwidth">

                  {categories
                    .filter(cat => cat.fullWidth)
                    .map(cat => (

                      <label
                        key={cat.id}
                        className={`category-card fullwidth ${formData.category === cat.id ? 'selected' : ''}`}
                      >

                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={formData.category === cat.id}
                          onChange={handleInputChange}
                          className="category-radio"
                        />

                        <div className="category-icon">{cat.icon}</div>
                        <div className="category-label">{cat.label}</div>

                      </label>

                    ))}

                </div>

              </div>

            </div>

            {/* Block */}

            <div className="form-group">

              <label className="form-label">Block / Location</label>

              <div className={`input-wrapper ${focusedField === 'block' ? 'focused' : ''}`}>

                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('block')}
                  onBlur={() => setFocusedField('')}
                  className="form-input"
                  placeholder="e.g., Block A, Library, Cafeteria"
                  required
                />

                <div className="input-icon">📍</div>

              </div>

            </div>

            {/* Description */}

            <div className="form-group">

              <label className="form-label">Description</label>

              <div className={`textarea-wrapper ${focusedField === 'description' ? 'focused' : ''}`}>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField('')}
                  className="form-textarea"
                  placeholder="Tell us what's going on. The more details, the faster we can fix it."
                  rows="5"
                  required
                />

                <div className="textarea-icon">💬</div>

              </div>

            </div>

            {/* Image Upload */}

            <div className="form-group">

              <label className="form-label">Upload Image (Optional)</label>

              <div className="file-upload">

                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />

                <label htmlFor="image" className="file-label">

                  <div className="file-icon">📎</div>

                  <div className="file-text">
                    {formData.image
                      ? formData.image.name
                      : 'Got proof? Drop an image here 📸 (optional)'
                    }
                  </div>

                </label>

              </div>

            </div>

            {/* Submit Button */}

            <button
              type="submit"
              className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Send Complaint 🚀
                </>
              )}

            </button>

          </form>

        </div>

      </div>

      {/* Success Toast */}

      {showSuccess && (
        <div className="success-toast">
          <div className="toast-icon">✅</div>
          <div className="toast-message">Complaint submitted successfully!</div>
        </div>
      )}

    </div>
  );
}