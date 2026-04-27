import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './SubmitComplaint.css';

/* ─── Keyword-based Sentiment Engine ─────────────────────── */
const NEGATIVE_WORDS = [
  'broken','damaged','leaking','not working','broken','crash','failed','issue','problem','stuck',
  'dirty','smelly','loud','noisy','dangerous','unsafe','broken','unusable','terrible','horrible',
  'disgusting','awful','bad','poor','worst','pathetic','useless','horrible','neglected','ignored',
  'dark','flooding','flooded','blocked','clogged','faulty','malfunction','dead','burnt','insect',
  'cockroach','rat','pest','mold','mould','fungus','stink','stench','sewage','garbage',
];
const POSITIVE_WORDS = [
  'good','clean','fine','ok','nice','better','improved','fixed','working','resolved',
];
const URGENCY_WORDS = [
  'urgent','emergency','immediately','asap','critical','severe','serious','extreme','danger',
  'hazard','health','injury','electric shock','fire','flooding',
];
const IMPACT_WORDS = [
  'students','everyone','all','class','hostel','bathroom','corridor','many','multiple','entire',
  'whole','block','floor','wing',
];

function analyzeSentiment(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount < 3) return null;

  /* Sentiment scoring */
  let negScore = 0, posScore = 0;
  NEGATIVE_WORDS.forEach(w => { if (text.includes(w)) negScore++; });
  POSITIVE_WORDS.forEach(w => { if (text.includes(w)) posScore++; });
  const urgencyHits = URGENCY_WORDS.filter(w => text.includes(w)).length;
  const impactHits  = IMPACT_WORDS.filter(w => text.includes(w)).length;

  let sentiment;
  if (negScore > posScore + 1) sentiment = 'Negative';
  else if (posScore > negScore) sentiment = 'Positive';
  else sentiment = 'Neutral';

  /* Strength: 0–100 */
  let strength = 0;
  strength += Math.min(wordCount / 80 * 35, 35);   // length (max 35)
  strength += Math.min(negScore * 6, 20);            // negative signals
  strength += Math.min(urgencyHits * 10, 20);        // urgency keywords
  strength += Math.min(impactHits * 5, 15);          // impact scope
  strength += description.length > 100 ? 10 : 0;    // detail bonus
  strength = Math.round(Math.min(strength, 100));

  let level, levelColor, levelBg, levelIcon;
  if (strength >= 80)      { level = 'Critical';  levelColor = '#dc2626'; levelBg = '#fef2f2'; levelIcon = '🚨'; }
  else if (strength >= 55) { level = 'Strong';    levelColor = '#d97706'; levelBg = '#fffbeb'; levelIcon = '⚡'; }
  else if (strength >= 30) { level = 'Moderate';  levelColor = '#2563eb'; levelBg = '#eff6ff'; levelIcon = '📋'; }
  else                     { level = 'Weak';      levelColor = '#64748b'; levelBg = '#f8fafc'; levelIcon = '💬'; }

  /* Tips */
  const tips = [];
  if (wordCount < 30)       tips.push('Add more detail — describe when/where/how it happened.');
  if (urgencyHits === 0)    tips.push("Mention if there's a safety or health risk to raise priority.");

  if (impactHits === 0)     tips.push('Describe how many people are affected.');
  if (!title.trim())        tips.push('A clear, specific title helps admins find your complaint faster.');

  return { sentiment, strength, level, levelColor, levelBg, levelIcon, wordCount, tips };
}

/* ─── Sentiment Panel UI ────────────────────────────────── */
function SentimentPanel({ analysis, visible }) {
  if (!visible || !analysis) return null;
  const { sentiment, strength, level, levelColor, levelBg, levelIcon, wordCount, tips } = analysis;
  const sentimentEmoji = { Positive: '😊', Neutral: '😐', Negative: '😟' };
  const sentimentColor = { Positive: '#10b981', Neutral: '#f59e0b', Negative: '#ef4444' };

  return (
    <div className="sc-sentiment-panel" style={{ '--accent': levelColor }}>
      <div className="sc-sentiment-header">
        <span className="sc-sentiment-ai-badge">🤖 AI Analysis</span>
        <span className="sc-sentiment-words">{wordCount} words</span>
      </div>

      {/* Strength meter */}
      <div className="sc-strength-block">
        <div className="sc-strength-top">
          <span className="sc-strength-icon">{levelIcon}</span>
          <span className="sc-strength-level" style={{ color: levelColor }}>{level} Complaint</span>
          <span className="sc-strength-pct" style={{ color: levelColor }}>{strength}%</span>
        </div>
        <div className="sc-strength-bar-bg">
          <div
            className="sc-strength-bar-fill"
            style={{ width: `${strength}%`, background: strength>=80?'#dc2626':strength>=55?'#d97706':strength>=30?'#2563eb':'#94a3b8' }}
          />
        </div>
        <div className="sc-strength-labels">
          <span>Weak</span><span>Moderate</span><span>Strong</span><span>Critical</span>
        </div>
      </div>

      {/* Sentiment badge */}
      <div className="sc-meta-row">
        <div className="sc-meta-item">
          <span className="sc-meta-label">Sentiment</span>
          <span className="sc-meta-val" style={{ color: sentimentColor[sentiment] }}>
            {sentimentEmoji[sentiment]} {sentiment}
          </span>
        </div>
        <div className="sc-meta-item">
          <span className="sc-meta-label">Priority Score</span>
          <span className="sc-meta-val" style={{ color: levelColor }}>{strength}/100</span>
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="sc-tips">
          <span className="sc-tips-title">💡 Tips to strengthen your complaint</span>
          <ul className="sc-tips-list">
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SubmitComplaint() {
  

  const navigate = useNavigate();

  // TODO: re-enable auth guard once login flow is complete
  /*
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/student/login');
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
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Sentiment analysis — debounced
  const [sentiment, setSentiment] = useState(null);
  const sentimentTimer = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    // Debounce analysis by 400ms
    clearTimeout(sentimentTimer.current);
    sentimentTimer.current = setTimeout(() => {
      setSentiment(analyzeSentiment(updated.title, updated.description));
    }, 400);
  };

  const categories = [
    { id: 'hostel', label: 'Hostel', icon: '🏠' },
    { id: 'academics', label: 'Academics', icon: '📚' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { id: 'others', label: 'Others', icon: '📋', fullWidth: true }
  ];



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

                <select
                  name="block"
                  value={formData.block}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('block')}
                  onBlur={() => setFocusedField('')}
                  className="form-input"
                  required
                >
                  <option value="">Select block / location…</option>
                  {['A','B','C','D','E','F','G','H','I','J','K','L','M','N'].map(b => (
                    <option key={b} value={`Block ${b}`}>Block {b}</option>
                  ))}
                  <option value="Library">Library</option>
                  <option value="Mess Hall">Mess Hall</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Sports Ground">Sports Ground</option>
                </select>

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

              {/* ── Live AI Sentiment Panel ── */}
              <SentimentPanel
                analysis={sentiment}
                visible={!!(formData.description.trim() || formData.title.trim())}
              />

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

            {/* Anonymous Toggle */}
            <div className="anon-toggle-wrap">
              <button
                type="button"
                className={`anon-toggle-btn ${isAnonymous ? 'anon-toggle-btn--active' : ''}`}
                onClick={() => setIsAnonymous(a => !a)}
              >
                <span className="anon-toggle-icon">{isAnonymous ? '🎭' : '👤'}</span>
                <div className="anon-toggle-text">
                  <span className="anon-toggle-label">
                    {isAnonymous ? 'Submitting Anonymously' : 'Submit Anonymously'}
                  </span>
                  <span className="anon-toggle-desc">
                    {isAnonymous
                      ? 'Your name & roll number will be hidden from this complaint'
                      : 'Hide your identity — only the complaint details are shared'}
                  </span>
                </div>
                <div className={`anon-toggle-switch ${isAnonymous ? 'anon-toggle-switch--on' : ''}`}>
                  <div className="anon-toggle-knob" />
                </div>
              </button>
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
          <div className="toast-icon">{isAnonymous ? '🎭' : '✅'}</div>
          <div className="toast-message">
            {isAnonymous
              ? 'Anonymous complaint submitted! Your identity is protected.'
              : 'Complaint submitted successfully!'}
          </div>
        </div>
      )}

    </div>
  );
}