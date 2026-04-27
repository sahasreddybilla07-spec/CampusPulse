import { useState, useEffect } from 'react';
import { getAllComplaints } from '../services/admin';
import Navbar from './Navbar';
import Logo from './Logo';
import './PublicComplaints.css';

const CATEGORIES = ['All', 'Maintenance', 'Infrastructure', 'Hostel', 'Academics'];
const STATUSES   = ['All', 'Pending', 'In Progress', 'Resolved'];

const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const PRIORITY_BG    = { High: '#fef2f2', Medium: '#fffbeb', Low: '#ecfdf5' };
const STATUS_COLOR   = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#10b981' };
const STATUS_BG      = { Pending: '#fffbeb', 'In Progress': '#eff6ff', Resolved: '#ecfdf5' };

const CAT_ICONS = { Maintenance: '🔧', Infrastructure: '🏗️', Hostel: '🏠', Academics: '📚' };

export default function PublicComplaints() {
  const [category, setCategory] = useState('All');
  const [status, setStatus]     = useState('All');
  const [search, setSearch]     = useState('');
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [sort, setSort]         = useState('date');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllComplaints();
        setComplaints(data || []);
      } catch (err) {
        console.error('Failed to load public complaints:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = complaints
    .filter(c => {
      const mc = category === 'All' || c.category === category;
      const ms = status   === 'All' || c.status   === status;
      const mq = c.title.toLowerCase().includes(search.toLowerCase()) ||
                 c.block.toLowerCase().includes(search.toLowerCase());
      return mc && ms && mq;
    })
    .sort((a, b) => {
      if (sort === 'priority') {
        const p = { High: 3, Medium: 2, Low: 1 };
        return p[b.priority] - p[a.priority];
      }
      return new Date(b.created_at) - new Date(a.created_at); // date
    });

  const total    = complaints.length;
  const pendingCount  = complaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  if (isLoading) return <div className="pc-loading">Loading Transparency Board…</div>;


  return (
    <div className="pc-root">
      <Navbar />

      {/* Hero banner */}
      <div className="pc-hero">
        <div className="pc-hero-inner">
          <div style={{ filter: 'brightness(0) invert(1) opacity(0.75)', marginBottom: '0.5rem' }}>
            <Logo />
          </div>
          <span className="pc-hero-badge">📋 Transparency Board</span>
          <h1 className="pc-hero-title">Campus Complaints</h1>
          <p className="pc-hero-sub">All complaints raised by students — tracked publicly for transparency and accountability.</p>

          <div className="pc-hero-stats">
            <div className="pc-hero-stat">
              <span className="pc-hero-stat-num">{total}</span>
              <span className="pc-hero-stat-lbl">Total</span>
            </div>
            <div className="pc-hero-stat-div" />
            <div className="pc-hero-stat">
              <span className="pc-hero-stat-num pc-num-amber">{pendingCount}</span>
              <span className="pc-hero-stat-lbl">Pending</span>
            </div>
            <div className="pc-hero-stat-div" />
            <div className="pc-hero-stat">
              <span className="pc-hero-stat-num pc-num-green">{resolvedCount}</span>
              <span className="pc-hero-stat-lbl">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pc-content">

        {/* Toolbar */}
        <div className="pc-toolbar">
          {/* Search */}
          <div className="pc-search-wrap">
            <svg className="pc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="pc-search"
              placeholder="Search complaints or blocks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <select className="pc-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="date">Sort: Latest</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>

        {/* Category filter pills */}
        <div className="pc-filter-row">
          <div className="pc-filter-group">
            <span className="pc-filter-label">Category:</span>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`pc-pill ${category === c ? 'pc-pill--active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c !== 'All' && <span>{CAT_ICONS[c]}</span>}
                {c}
              </button>
            ))}
          </div>
          <div className="pc-filter-group">
            <span className="pc-filter-label">Status:</span>
            {STATUSES.map(s => (
              <button
                key={s}
                className={`pc-pill ${status === s ? 'pc-pill--active pc-pill--' + s.replace(' ', '-').toLowerCase() : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="pc-results-count">
          Showing <strong>{filtered.length}</strong> complaint{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Complaint cards */}
        <div className="pc-cards">
          {filtered.length === 0 && (
            <div className="pc-empty">
              <span>😕</span>
              <p>No complaints match your filters.</p>
            </div>
          )}

          {filtered.map(c => {
            const isOpen  = expanded === c.id;

            return (
              <div
                key={c.id}
                className={`pc-card ${isOpen ? 'pc-card--open' : ''}`}
                onClick={() => setExpanded(isOpen ? null : c.id)}
              >
                <div className="pc-card-main">
                  <div className="pc-vote pc-vote--static">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    <span>0</span>
                  </div>

                  {/* Content */}
                  <div className="pc-card-body">
                    <div className="pc-card-top">
                      <span className="pc-card-id">{c.id}</span>
                      <span className="pc-tag" style={{ color: PRIORITY_COLOR[c.priority], background: PRIORITY_BG[c.priority] }}>{c.priority}</span>
                      <span className="pc-tag" style={{ color: STATUS_COLOR[c.status], background: STATUS_BG[c.status] }}>{c.status}</span>
                    </div>

                    <h3 className="pc-card-title">{c.title}</h3>

                    <div className="pc-card-meta">
                      <span>📍 {c.block}</span>
                      <span>🏷️ {c.category}</span>
                      <span>🗓️ {new Date(c.created_at).toLocaleDateString()}</span>
                    </div>

                    {isOpen && (
                      <p className="pc-card-desc">{c.description}</p>
                    )}
                  </div>

                  <span className="pc-card-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
