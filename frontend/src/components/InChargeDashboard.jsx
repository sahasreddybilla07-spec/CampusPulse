import { useState, useEffect } from 'react';
import LogoMark from './LogoMark';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getAssignedComplaints, 
  updateComplaintStatus, 
  updateProfile, 
  changePassword 
} from '../services/complaints';
import './InChargeDashboard.css';


const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const PRIORITY_BG    = { High: '#fef2f2', Medium: '#fffbeb', Low: '#ecfdf5' };
const STATUS_COLOR   = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#10b981' };
const STATUS_BG      = { Pending: '#fffbeb', 'In Progress': '#eff6ff', Resolved: '#ecfdf5' };

export default function InChargeDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  /* Profile Tab state */
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (profile) setEditProfile(profile);
  }, [profile]);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getAssignedComplaints(user.id);
      setComplaints(data || []);
    } catch (err) {
      console.error('Error loading incharge data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/student/login');
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { id, created_at, updated_at, role, email, employee_id, password_ref, ...updatable } = editProfile;
      await updateProfile(user.id, updatable);
      await refreshProfile();
      setEditMode(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const filtered = complaints.filter(c => {
    const matchFilter = filter === 'All' || c.status === filter;
    const matchSearch = 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      c.block.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = [
    { label: 'Total Assigned', value: complaints.length, icon: '📋', color: '#667eea', bg: '#eef2ff' },
    { label: 'Pending', value: complaints.filter(c=>c.status==='Pending').length, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'In Progress', value: complaints.filter(c=>c.status==='In Progress').length, icon: '🔄', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Resolved', value: complaints.filter(c=>c.status==='Resolved').length, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  ];

  if (isLoading || !profile) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a', color:'#fff', fontSize:'1.2rem' }}>
        Loading Dashboard…
      </div>
    );
  }

  const initials = profile.name ? profile.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'IC';


  return (
    <div className="ic-root">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`ic-sidebar ${sidebarOpen ? 'ic-sidebar--open' : 'ic-sidebar--collapsed'}`}>
        <div className="ic-sidebar-brand">
          {sidebarOpen
            ? <div style={{ transform: 'scale(0.48)', transformOrigin: 'left center', marginLeft: '-0.5rem' }}><Logo /></div>
            : <LogoMark variant="colored" showText={false} size={36} />}
        </div>

        <nav className="ic-nav">
          {[
            { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
            { id: 'complaints', icon: '📋', label: 'Complaints' },
            { id: 'profile',    icon: '👤', label: 'My Profile' },
            { id: 'analytics',  icon: '📈', label: 'Analytics' },
          ].map(item => (
            <button
              key={item.id}
              className={`ic-nav-item ${activeNav === item.id ? 'ic-nav-item--active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="ic-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="ic-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="ic-sidebar-footer">
          <div className="ic-user-chip">
            <div className="ic-user-avatar">{initials}</div>
            {sidebarOpen && (
              <div className="ic-user-info">
                <span className="ic-user-name">{profile.name}</span>
                <span className="ic-user-role">{profile.designation || 'In-Charge'}</span>
              </div>
            )}
          </div>
          <button className="ic-logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="ic-main">

        {/* Topbar */}
        <header className="ic-topbar">
          <div className="ic-topbar-left">
            <button className="ic-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 className="ic-page-title">In-Charge Dashboard</h1>
              <p className="ic-page-sub">Block A — Manage & resolve complaints</p>
            </div>
          </div>
          <div className="ic-topbar-right">
            <span className="ic-badge-live">● Live</span>
            <div className="ic-notif-btn">
              🔔
              <span className="ic-notif-dot">{complaints.filter(c=>c.status==='Pending').length}</span>
            </div>
          </div>
        </header>

        <div className="ic-content">

          {/* Stat cards */}
          <div className="ic-stats-row">
            {stats.map(s => (
              <div key={s.label} className="ic-stat-card">
                <div className="ic-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <p className="ic-stat-value">{s.value}</p>
                  <p className="ic-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="ic-toolbar">
            <div className="ic-filter-tabs">
              {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
                <button
                  key={f}
                  className={`ic-filter-btn ${filter === f ? 'ic-filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  <span className="ic-filter-count">
                    {f === 'All' ? complaints.length : complaints.filter(c => c.status === f).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="ic-search-wrap">
              <svg className="ic-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ic-search"
                placeholder="Search complaints, students, blocks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Complaint table */}
          <div className="ic-table-card">
            <div className="ic-table-header">
              <span>Complaint</span>
              <span>Category</span>
              <span>Location</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="ic-table-body">
              {filtered.length === 0 && (
                <div className="ic-empty">No complaints match your filter.</div>
              )}
              {filtered.map(c => (
                <div key={c.id} className="ic-table-row" onClick={() => setSelected(c)}>
                  <div className="ic-col-complaint">
                    <span className="ic-complaint-id">{c.id}</span>
                    <span className="ic-complaint-title">{c.title}</span>
                    <span className="ic-complaint-student">👤 {c.student?.name || 'Unknown'}</span>
                  </div>
                  <span className="ic-tag ic-tag-cat">{c.category}</span>
                  <div className="ic-col-loc">
                    <span>{c.block}</span>
                    <span className="ic-floor">{c.floor}</span>
                  </div>
                  <span className="ic-tag"
                    style={{ color: PRIORITY_COLOR[c.priority], background: PRIORITY_BG[c.priority] }}>
                    {c.priority}
                  </span>
                  <span className="ic-tag"
                    style={{ color: STATUS_COLOR[c.status], background: STATUS_BG[c.status] }}>
                    {c.status}
                  </span>
                  <div className="ic-actions" onClick={e => e.stopPropagation()}>
                    {c.status !== 'Resolved' && (
                      <button className="ic-action-btn ic-action-btn--resolve"
                        onClick={() => updateStatus(c.id, 'Resolved')}>✓ Resolve</button>
                    )}
                    {c.status === 'Pending' && (
                      <button className="ic-action-btn ic-action-btn--progress"
                        onClick={() => updateStatus(c.id, 'In Progress')}>▶ Start</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Profile Management Tab */}
          {activeNav === 'profile' && (
            <div className="ic-profile-view">
               <div className="ic-table-card" style={{ padding: '2rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
                    <h2 style={{ margin:0 }}>My Profile</h2>
                    <button 
                      className={`ic-action-btn ${editMode ? 'ic-action-btn--escalate' : 'ic-action-btn--progress'}`}
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
                    </button>
                  </div>
                  
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'2rem' }}>
                    {[
                      { label: 'Full Name', key: 'name', icon: '👤' },
                      { label: 'Employee ID', key: 'employee_id', icon: '🎫', readOnly: true },
                      { label: 'Designation', key: 'designation', icon: '🏷️' },
                      { label: 'Email', key: 'email', icon: '📧', readOnly: true },
                      { label: 'Phone', key: 'phone', icon: '📱' },
                      { label: 'Assigned Block', key: 'assigned_block', icon: '📍' },
                    ].map(f => (
                      <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        <label style={{ fontSize:'0.85rem', color:'#64748b', fontWeight:600 }}>{f.icon} {f.label}</label>
                        {editMode && !f.readOnly ? (
                          <input 
                            style={{ padding:'0.75rem', borderRadius:'8px', border:'1px solid #e2e8f0', outline:'none' }}
                            value={editProfile[f.key] || ''}
                            onChange={e => setEditProfile({...editProfile, [f.key]: e.target.value})}
                          />
                        ) : (
                          <div style={{ padding:'0.75rem', background:'#f8fafc', borderRadius:'8px', color:'#1e293b', fontWeight:500 }}>
                            {profile[f.key] || 'Not set'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editMode && (
                    <button 
                      className="ic-action-btn ic-action-btn--resolve" 
                      style={{ marginTop:'2rem', width:'100%', padding:'1rem' }}
                      onClick={saveProfile}
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────── */}
      {selected && (
        <div className="ic-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ic-modal" onClick={e => e.stopPropagation()}>
            <div className="ic-modal-header">
              <div>
                <span className="ic-modal-id">{selected.id}</span>
                <h2 className="ic-modal-title">{selected.title}</h2>
              </div>
              <button className="ic-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="ic-modal-meta">
              <div className="ic-meta-item">
                <span className="ic-meta-key">Student</span>
                <span className="ic-meta-val">{selected.student?.name || 'Unknown'} ({selected.student?.roll_no || 'N/A'})</span>
              </div>
              <div className="ic-meta-item">
                <span className="ic-meta-key">Location</span>
                <span className="ic-meta-val">{selected.block}, {selected.floor}</span>
              </div>
              <div className="ic-meta-item">
                <span className="ic-meta-key">Category</span>
                <span className="ic-meta-val">{selected.category}</span>
              </div>
              <div className="ic-meta-item">
                <span className="ic-meta-key">Filed On</span>
                <span className="ic-meta-val">{selected.date}</span>
              </div>
              <div className="ic-meta-item">
                <span className="ic-meta-key">Priority</span>
                <span className="ic-tag" style={{ color: PRIORITY_COLOR[selected.priority], background: PRIORITY_BG[selected.priority] }}>{selected.priority}</span>
              </div>
              <div className="ic-meta-item">
                <span className="ic-meta-key">Status</span>
                <span className="ic-tag" style={{ color: STATUS_COLOR[selected.status], background: STATUS_BG[selected.status] }}>{selected.status}</span>
              </div>
            </div>

            <div className="ic-modal-desc">
              <p className="ic-meta-key">Description</p>
              <p className="ic-modal-desc-text">{selected.description}</p>
            </div>

            <div className="ic-modal-actions">
              {selected.status !== 'Resolved' && (
                <button className="ic-action-btn ic-action-btn--resolve ic-modal-btn"
                  onClick={() => updateStatus(selected.id, 'Resolved')}>
                  ✓ Mark as Resolved
                </button>
              )}
              {selected.status === 'Pending' && (
                <button className="ic-action-btn ic-action-btn--progress ic-modal-btn"
                  onClick={() => updateStatus(selected.id, 'In Progress')}>
                  ▶ Start Working
                </button>
              )}
              {selected.status !== 'Resolved' && (
                <button className="ic-action-btn ic-action-btn--escalate ic-modal-btn"
                  onClick={() => { updateStatus(selected.id, 'Pending'); setSelected(null); }}>
                  ⬆ Escalate to Admin
                </button>
              )}
              <button className="ic-action-btn ic-action-btn--close ic-modal-btn"
                onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
