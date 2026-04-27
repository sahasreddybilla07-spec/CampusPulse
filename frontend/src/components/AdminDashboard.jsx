import { useState, useEffect } from 'react';
import LogoMark from './LogoMark';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as adminService from '../services/admin';
import { getAnalyticsSummary } from '../services/admin';
import { updateComplaintStatus, updateProfile } from '../services/complaints';
import './AdminDashboard.css';

/* ─── Constants ───────────────────────────────── */
const BLOCKS_LIST = [
  'Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G', 'Block H', 
  'Block I', 'Block J', 'Block K', 'Block L', 'Block M', 'Block N',
  'Library', 'Mess Hall', 'Common Area'
];

const NAV_ITEMS = [
  { id: 'overview',   icon: '📊', label: 'Overview'        },
  { id: 'complaints', icon: '📋', label: 'All Complaints'  },
  { id: 'users',      icon: '👥', label: 'In-Charges'      },
  { id: 'profile',    icon: '👤', label: 'My Profile'      },
  { id: 'analytics',  icon: '📈', label: 'Analytics'       },
  { id: 'settings',   icon: '⚙️',  label: 'Settings'        },
];

const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const PRIORITY_BG    = { High: '#fef2f2', Medium: '#fffbeb', Low: '#ecfdf5' };
const STATUS_COLOR   = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#10b981' };
const STATUS_BG      = { Pending: '#fffbeb', 'In Progress': '#eff6ff', Resolved: '#ecfdf5' };
const SENTIMENT_COLOR = { Positive: '#10b981', Neutral: '#f59e0b', Negative: '#ef4444' };

/* ─── Performance scoring ───────────────────────────────── */
function calcPerf(ic) {
  const resRate   = ic.complaints > 0 ? (ic.resolved / ic.complaints) : 0;
  const ratingPct = ic.avgRating / 5;
  const activePts = ic.status === 'Active' ? 10 : 0;
  const score     = Math.round(resRate * 50 + ratingPct * 40 + activePts);

  let badge, badgeColor, badgeBg;
  if (score >= 80)      { badge = '🚀 Promote';            badgeColor = '#065f46'; badgeBg = '#d1fae5'; }
  else if (score >= 65) { badge = '💰 Eligible for Hike';  badgeColor = '#1e40af'; badgeBg = '#dbeafe'; }
  else if (score >= 45) { badge = '✅ Satisfactory';        badgeColor = '#92400e'; badgeBg = '#fef3c7'; }
  else                  { badge = '⚠️ Needs Improvement';  badgeColor = '#991b1b'; badgeBg = '#fee2e2'; }

  return { score, badge, badgeColor, badgeBg };
}

/* ─── Star renderer ─────────────────────────────────────── */
function Stars({ value, max = 5, onSelect = null }) {
  return (
    <span className="ad-stars">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`ad-star ${i < Math.round(value) ? 'ad-star--on' : ''} ${onSelect ? 'ad-star--clickable' : ''}`}
          onClick={() => onSelect && onSelect(i + 1)}
        >★</span>
      ))}
    </span>
  );
}

/* ─── Empty BLOCKS check ────────────────────────────────── */
function unassignedBlocks(incharges) {
  const taken = new Set(incharges.filter(i => i.status === 'Active').map(i => i.block));
  return BLOCKS_LIST.filter(b => !taken.has(b));
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();

  /* Main Data */
  const [complaints, setComplaints] = useState([]);
  const [incharges, setIncharges]   = useState([]);
  const [analytics, setAnalytics]   = useState(null);
  const [isLoading, setIsLoading]   = useState(true);

  /* Dashboard State */
  const [activeNav,  setActiveNav]  = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter]  = useState('All');
  const [search, setSearch]  = useState('');
  const [selected, setSelected] = useState(null);
  const [usersTab,  setUsersTab]    = useState('assignments');

  /* Modals */
  const [showAddIC,       setShowAddIC]       = useState(false);
  const [reassignTarget,  setReassignTarget]  = useState(null);
  const [removeTarget,    setRemoveTarget]    = useState(null);
  const [feedbackTarget,  setFeedbackTarget]  = useState(null);
  const [generatedCreds,  setGeneratedCreds]  = useState(null); // for showing temp password

  /* Form state */
  const blankIC = { name:'', email:'', phone:'', designation:'', block: BLOCKS_LIST[0] };
  const [newIC, setNewIC] = useState(blankIC);
  const [reassignBlock, setReassignBlock] = useState('');
  const [fbForm, setFbForm] = useState({ rating: 0, comment: '', anonymous: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Profile Tab */
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
      const [allC, allI, summary] = await Promise.all([
        adminService.getAllComplaints(),
        adminService.getAllIncharges(),
        getAnalyticsSummary()
      ]);
      setComplaints(allC || []);
      setIncharges(allI || []);
      setAnalytics(summary);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/student/login');
  };

  const updateStatus = async (id, s) => {
    try {
      await updateComplaintStatus(id, s);
      setComplaints(p => p.map(c => c.id === id ? { ...c, status: s } : c));
      if (selected?.id === id) setSelected(p => ({ ...p, status: s }));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const addIncharge = async () => {
    if (!newIC.name.trim() || !newIC.email.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await adminService.createIncharge({
        name: newIC.name,
        email: newIC.email,
        designation: newIC.designation || 'In-Charge',
        block: newIC.block
      });
      setGeneratedCreds(result);
      await loadData();
      setNewIC(blankIC);
      setShowAddIC(false);
    } catch (err) {
      alert('Failed to create in-charge: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeIncharge = async (id) => {
    try {
      await adminService.removeIncharge(id);
      setIncharges(p => p.filter(i => i.id !== id));
      setRemoveTarget(null);
    } catch (err) {
      alert('Failed to remove in-charge: ' + err.message);
    }
  };

  const toggleStatus = async (id, currentIsActive) => {
    try {
      await updateProfile(id, { is_active: !currentIsActive });
      setIncharges(p => p.map(i => i.id === id ? { ...i, is_active: !currentIsActive } : i));
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const doReassign = async () => {
    if (!reassignBlock) return;
    try {
      await updateProfile(reassignTarget.id, { assigned_block: reassignBlock });
      setIncharges(p => p.map(i => i.id === reassignTarget.id ? { ...i, assigned_block: reassignBlock } : i));
      setReassignTarget(null);
      setReassignBlock('');
    } catch (err) {
      alert('Failed to reassign: ' + err.message);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { id, created_at, updated_at, role, email, password_ref, ...updatable } = editProfile;
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
    const mF = filter === 'All' || c.status === filter;
    const mS = c.title.toLowerCase().includes(search.toLowerCase()) ||
               (c.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
               c.block.toLowerCase().includes(search.toLowerCase());
    return mF && mS;
  });

  const total    = complaints.length;
  const pending  = complaints.filter(c => c.status === 'Pending').length;
  const progress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const resRate  = total > 0 ? Math.round((resolved / total) * 100) : 0;

  if (isLoading || !profile) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f172a', color:'#fff' }}>
        Loading System Dashboard…
      </div>
    );
  }

  const initials = profile.name ? profile.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'A';


  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="ad-root">

      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'ad-sidebar--open' : 'ad-sidebar--collapsed'}`}>
        <div className="ad-sidebar-brand">
          {sidebarOpen
            ? <div style={{ transform: 'scale(0.48)', transformOrigin: 'left center', marginLeft: '-0.5rem' }}><Logo /></div>
            : <LogoMark variant="colored" showText={false} size={36} />}
        </div>
        <nav className="ad-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeNav === item.id ? 'ad-nav-item--active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="ad-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-footer">
          <div className="ad-user-chip">
            <div className="ad-user-avatar">A</div>
            {sidebarOpen && (
              <div className="ad-user-info">
                <span className="ad-user-name">Admin</span>
                <span className="ad-user-role">Full Access</span>
              </div>
            )}
          </div>
          <button className="ad-logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="ad-main">

        {/* Topbar */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 className="ad-page-title">
                {activeNav === 'overview'   && 'System Overview'}
                {activeNav === 'complaints' && 'All Complaints'}
                {activeNav === 'users'      && 'In-Charge Management'}
                {activeNav === 'analytics'  && 'Analytics & Reports'}
                {activeNav === 'settings'   && 'System Settings'}
              </h1>
              <p className="ad-page-sub">CampusPulse — {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
            </div>
          </div>
          <div className="ad-topbar-right">
            <span className="ad-res-rate">
              <span className="ad-res-rate-val">{resRate}%</span>
              <span className="ad-res-rate-label">Resolution Rate</span>
            </span>
            <div className="ad-notif-btn">🔔<span className="ad-notif-dot">{pending}</span></div>
            <div className="ad-admin-chip">
              <div className="ad-admin-avatar">{initials}</div>
              <div className="ad-admin-info">
                <span className="ad-admin-name">{profile.name}</span>
                <span className="ad-admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Overview ────────────────────────────────── */}
        {activeNav === 'overview' && (
          <div className="ad-content">
            <div className="ad-kpi-row">
              {[
                { label:'Total Complaints', value: total,    icon:'📋', color:'#667eea', bg:'#eef2ff', sub: 'All time' },
                { label:'Pending',          value: pending,  icon:'⏳', color:'#f59e0b', bg:'#fffbeb', sub: 'Needs action' },
                { label:'In Progress',      value: progress, icon:'🔄', color:'#3b82f6', bg:'#eff6ff', sub: 'Being resolved' },
                { label:'Resolved',         value: resolved, icon:'✅', color:'#10b981', bg:'#ecfdf5', sub: `${resRate}% rate` },
              ].map(k => (
                <div key={k.label} className="ad-kpi-card">
                  <div className="ad-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
                  <div>
                    <p className="ad-kpi-value">{k.value}</p>
                    <p className="ad-kpi-label">{k.label}</p>
                    <p className="ad-kpi-sub">{k.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ad-charts-row">
              <div className="ad-chart-card ad-chart-card--wide">
                <h3 className="ad-chart-title">Complaint Distribution by Block</h3>
                <p className="ad-chart-sub">Real-time heat map of campus issues</p>
                <div className="ad-bar-chart" style={{ height: '240px', alignItems: 'flex-end' }}>
                  {analytics?.block_stats?.slice(0, 10).map(b => (
                    <div key={b.block} className="ad-bar-group">
                      <div className="ad-bar ad-bar--raised" style={{ height: `${(b.count / (analytics.total || 1)) * 100 * 2}%`, minHeight:'4px' }}>
                        <span className="ad-bar-tip">{b.count}</span>
                      </div>
                      <span className="ad-bar-day" style={{ fontSize: '0.65rem' }}>{b.block.replace('Block ', '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ad-chart-card">
                <h3 className="ad-chart-title">Status Distribution</h3>
                <p className="ad-chart-sub">Current resolution progress</p>
                <div className="ad-cat-list">
                  {[
                    { label: 'Pending', count: pending, color: '#f59e0b' },
                    { label: 'In Progress', count: progress, color: '#3b82f6' },
                    { label: 'Resolved', count: resolved, color: '#10b981' },
                  ].map(s => (
                    <div key={s.label} className="ad-cat-item">
                      <div className="ad-cat-header"><span className="ad-cat-name">{s.label}</span><span className="ad-cat-count">{s.count}</span></div>
                      <div className="ad-cat-bar-bg"><div className="ad-cat-bar-fill" style={{ width: `${total > 0 ? (s.count/total)*100 : 0}%`, background: s.color }}/></div>
                    </div>
                  ))}
                </div>
                <h3 className="ad-chart-title" style={{marginTop:'1.5rem'}}>Recent Activity</h3>
                <div className="ad-sentiment-row">
                  {[
                    { label:'Total', count: total, color:'#667eea', bg:'#eef2ff' },
                    { label:'Resolved', count: resolved, color:'#10b981', bg:'#ecfdf5' },
                  ].map(s => (
                    <div key={s.label} className="ad-sent-card" style={{ background: s.bg, flex: 1 }}>
                      <span className="ad-sent-val" style={{ color: s.color }}>{s.count}</span>
                      <span className="ad-sent-label" style={{ color: s.color }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ad-table-card">
              <div className="ad-section-header">
                <h3 className="ad-chart-title">Recent Complaints</h3>
                <button className="ad-view-all-btn" onClick={() => setActiveNav('complaints')}>View All →</button>
              </div>
              {renderTable(complaints.slice(0,5), updateStatus, setSelected, false)}
            </div>
          </div>
        )}

        {/* ── All Complaints ──────────────────────────── */}
        {activeNav === 'complaints' && (
          <div className="ad-content">
            <div className="ad-toolbar">
              <div className="ad-filter-tabs">
                {['All','Pending','In Progress','Resolved'].map(f => (
                  <button key={f} className={`ad-filter-btn ${filter===f ? 'ad-filter-btn--active' : ''}`} onClick={() => setFilter(f)}>
                    {f}<span className="ad-filter-count">{f==='All' ? complaints.length : complaints.filter(c=>c.status===f).length}</span>
                  </button>
                ))}
              </div>
              <div className="ad-search-wrap">
                <svg className="ad-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="ad-search" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
            </div>
            <div className="ad-table-card">
              {renderTable(filtered, updateStatus, setSelected, true)}
            </div>
          </div>
        )}

        {/* ── In-Charges (with sub-tabs) ──────────────── */}
        {activeNav === 'users' && (
          <div className="ad-content">

            {/* Sub-tab switcher */}
            <div className="ad-subtabs">
              <button className={`ad-subtab ${usersTab==='assignments' ? 'ad-subtab--active' : ''}`} onClick={() => setUsersTab('assignments')}>
                🏢 Block Assignments
              </button>
              <button className={`ad-subtab ${usersTab==='performance' ? 'ad-subtab--active' : ''}`} onClick={() => setUsersTab('performance')}>
                ⭐ Performance & Feedback
              </button>
            </div>

            {/* ── Assignments sub-tab ────────────────── */}
            {usersTab === 'assignments' && (
              <>
                {/* Header toolbar */}
                <div className="ad-assign-toolbar">
                  <div>
                    <h3 className="ad-assign-title">Block Assignment Manager</h3>
                    <p className="ad-assign-sub">{incharges.filter(i=>i.is_active).length} active in-charges · {unassignedBlocks(incharges).length} unassigned blocks</p>
                  </div>
                  <button className="ad-add-ic-btn" onClick={() => setShowAddIC(true)}>
                    + Add In-Charge
                  </button>
                </div>

                {/* Block → In-charge mapping grid */}
                <div className="ad-block-assign-grid">
                  {BLOCKS_LIST.map(block => {
                    const ic = incharges.find(i => i.assigned_block === block && i.is_active);
                    return (
                      <div key={block} className={`ad-block-card ${!ic ? 'ad-block-card--empty' : ''}`}>
                        <div className="ad-block-card-header">
                          <span className="ad-block-icon">🏢</span>
                          <span className="ad-block-name">{block}</span>
                          {ic
                            ? <span className="ad-status-badge ad-status-badge--active">Assigned</span>
                            : <span className="ad-status-badge ad-status-badge--inactive">Vacant</span>
                          }
                        </div>
                        {ic ? (
                          <>
                            <div className="ad-block-ic-info">
                              <div className="ad-block-ic-avatar">{ic.name ? ic.name.split(' ').map(n=>n[0]).join('').slice(0,2) : '??'}</div>
                              <div>
                                <p className="ad-block-ic-name">{ic.name}</p>
                                <p className="ad-block-ic-desig">{ic.designation}</p>
                                <p className="ad-block-ic-contact">📧 {ic.email}</p>
                              </div>
                            </div>
                            <div className="ad-block-stats">
                              <span className="ad-bstat"><strong>{ic.complaints}</strong> cases</span>
                              <span className="ad-bstat"><strong>{ic.resolved}</strong> resolved</span>
                              <span className="ad-bstat"><Stars value={ic.avgRating} /> {ic.avgRating}</span>
                            </div>
                            <div className="ad-block-actions">
                              <button className="ad-bact-btn ad-bact-btn--reassign" onClick={() => { setReassignTarget(ic); setReassignBlock(block); }}>
                                🔄 Reassign
                              </button>
                              <button className="ad-bact-btn ad-bact-btn--suspend" onClick={() => toggleStatus(ic.id, ic.is_active)}>
                                ⏸ Suspend
                              </button>
                              <button className="ad-bact-btn ad-bact-btn--remove" onClick={() => setRemoveTarget(ic)}>
                                🗑 Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="ad-block-vacant">
                            <p className="ad-block-vacant-txt">No in-charge assigned</p>
                            <button className="ad-add-ic-btn" style={{fontSize:'0.78rem',padding:'0.4rem 0.9rem'}} onClick={() => { setNewIC({...blankIC, block}); setShowAddIC(true); }}>
                              + Assign
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Suspended in-charges */}
                {incharges.some(i => !i.is_active) && (
                  <div className="ad-suspended-section">
                    <h4 className="ad-suspended-title">⏸ Suspended In-Charges</h4>
                    <div className="ad-suspended-list">
                      {incharges.filter(i => !i.is_active).map(ic => (
                        <div key={ic.id} className="ad-suspended-row">
                          <span className="ad-susp-name">{ic.name}</span>
                          <span className="ad-susp-block">{ic.assigned_block}</span>
                          <button className="ad-bact-btn ad-bact-btn--reassign" onClick={() => toggleStatus(ic.id, ic.is_active)}>▶ Reactivate</button>
                          <button className="ad-bact-btn ad-bact-btn--remove" onClick={() => setRemoveTarget(ic)}>🗑 Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Performance sub-tab ───────────────── */}
            {usersTab === 'performance' && (
              <>
                <div className="ad-perf-header">
                  <div>
                    <h3 className="ad-assign-title">Performance Dashboard</h3>
                    <p className="ad-assign-sub">AI-generated recommendations based on resolution rate, ratings & feedback</p>
                  </div>
                </div>

                {/* Score legend */}
                <div className="ad-perf-legend">
                  {[['🚀 Promote','#d1fae5','#065f46','Score ≥ 80'],['💰 Hike','#dbeafe','#1e40af','Score ≥ 65'],['✅ Satisfactory','#fef3c7','#92400e','Score ≥ 45'],['⚠️ Needs Improvement','#fee2e2','#991b1b','Score < 45']].map(([b,bg,c,hint])=>(
                    <span key={b} className="ad-perf-legend-item" style={{background:bg,color:c}}>{b} <small style={{opacity:0.7}}>({hint})</small></span>
                  ))}
                </div>

                <div className="ad-perf-grid">
                  {incharges.map(ic => {
                    const { score, badge, badgeColor, badgeBg } = calcPerf(ic);
                    return (
                      <div key={ic.id} className="ad-perf-card">
                        {/* Header */}
                        <div className="ad-perf-card-top">
                          <div className="ad-block-ic-avatar" style={{width:44,height:44,fontSize:'1rem'}}>
                            {ic.name ? ic.name.split(' ').map(n=>n[0]).join('').slice(0,2) : '??'}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <p className="ad-block-ic-name">{ic.name}</p>
                            <p className="ad-block-ic-desig">{ic.assigned_block} · {ic.designation}</p>
                          </div>
                          <span className="ad-status-badge" style={{background:badgeBg, color:badgeColor, border:`1px solid ${badgeColor}22`}}>{badge}</span>
                        </div>

                        {/* Score bar */}
                        <div className="ad-score-row">
                          <span className="ad-score-label">Performance Score</span>
                          <span className="ad-score-num" style={{color: badgeColor}}>{score}/100</span>
                        </div>
                        <div className="ad-score-bar-bg">
                          <div className="ad-score-bar-fill" style={{ width:`${score}%`, background: score>=80?'#10b981':score>=65?'#3b82f6':score>=45?'#f59e0b':'#ef4444' }} />
                        </div>

                        {/* Stats grid */}
                        <div className="ad-perf-stats">
                          <div className="ad-perf-stat">
                            <span className="ad-perf-stat-val">{ic.complaints > 0 ? Math.round((ic.resolved/ic.complaints)*100) : 0}%</span>
                            <span className="ad-perf-stat-lbl">Resolution</span>
                          </div>
                          <div className="ad-perf-stat">
                            <span className="ad-perf-stat-val">{ic.resolved}</span>
                            <span className="ad-perf-stat-lbl">Resolved</span>
                          </div>
                          <div className="ad-perf-stat">
                            <span className="ad-perf-stat-val">{ic.feedback.length}</span>
                            <span className="ad-perf-stat-lbl">Reviews</span>
                          </div>
                        </div>

                        {/* Star rating */}
                        <div className="ad-perf-rating-row">
                          <Stars value={ic.avgRating} />
                          <span className="ad-perf-rating-num">{ic.avgRating > 0 ? ic.avgRating.toFixed(1) : 'No ratings'}</span>
                        </div>

                        {/* Recent feedback */}
                        {ic.feedback.length > 0 && (
                          <div className="ad-fb-excerpts">
                            {ic.feedback.slice(-2).map((f, fi) => (
                              <div key={fi} className="ad-fb-excerpt">
                                <div className="ad-fb-excerpt-top">
                                  <Stars value={f.rating} />
                                  <span className="ad-fb-excerpt-by">{f.anonymous ? 'Anonymous' : f.by}</span>
                                  <span className="ad-fb-excerpt-role ad-fb-role--{f.role}">{f.role}</span>
                                  <span className="ad-fb-excerpt-date">{f.date}</span>
                                </div>
                                {f.comment && <p className="ad-fb-excerpt-comment">"{f.comment}"</p>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="ad-perf-actions">
                          <button className="ad-bact-btn ad-bact-btn--reassign" style={{flex:1}} onClick={() => { setFeedbackTarget(ic); setFbForm({ rating:0, comment:'', anonymous:false }); }}>
                            ✍️ Give Feedback
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PROFILE ────────────────────────────────────── */}
        {activeNav === 'profile' && (
          <div className="ad-content">
            <div className="ad-table-card" style={{ padding: '2.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2.5rem' }}>
                <div>
                  <h2 style={{ margin:0, fontSize:'1.75rem' }}>Administrator Profile</h2>
                  <p style={{ color:'#64748b', marginTop:'0.5rem' }}>Manage your account settings and personal information</p>
                </div>
                <button 
                  className={`ad-action-btn ${editMode ? 'ad-action-btn--close' : 'ad-action-btn--progress'}`}
                  style={{ padding:'0.75rem 1.5rem' }}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
                </button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:'2.5rem' }}>
                {[
                  { label: 'Full Name', key: 'name', icon: '👤' },
                  { label: 'Admin Level', key: 'admin_level', icon: '🔑', readOnly: true },
                  { label: 'Email', key: 'email', icon: '📧', readOnly: true },
                  { label: 'Phone', key: 'phone', icon: '📱' },
                ].map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <label style={{ fontSize:'0.9rem', color:'#475569', fontWeight:600 }}>{f.icon} {f.label}</label>
                    {editMode && !f.readOnly ? (
                      <input 
                        style={{ padding:'1rem', borderRadius:'12px', border:'1px solid #e2e8f0', outline:'none', fontSize:'1rem' }}
                        value={editProfile[f.key] || ''}
                        onChange={e => setEditProfile({...editProfile, [f.key]: e.target.value})}
                      />
                    ) : (
                      <div style={{ padding:'1rem', background:'#f8fafc', borderRadius:'12px', color:'#1e293b', fontWeight:500, fontSize:'1.1rem', border:'1px solid #f1f5f9' }}>
                        {profile[f.key] || 'Not set'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {editMode && (
                <button 
                  className="ad-action-btn ad-action-btn--resolve" 
                  style={{ marginTop:'3rem', width:'100%', padding:'1.25rem', fontSize:'1.1rem', fontWeight:600 }}
                  onClick={saveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving Changes...' : '💾 Save Changes'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics ──────────────────────────────── */}
        {activeNav === 'analytics' && (() => {
          // Build weekly trend from actual complaint dates
          const DAYS_LIST = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          const trendMap = {};
          DAYS_LIST.forEach(d => { trendMap[d] = { day: d, raised: 0, resolved: 0 }; });
          complaints.forEach(c => {
            const day = DAYS_LIST[new Date(c.created_at || c.date).getDay()];
            if (trendMap[day]) {
              trendMap[day].raised++;
              if (c.status === 'Resolved') trendMap[day].resolved++;
            }
          });
          const trendData = DAYS_LIST.map(d => trendMap[d]);
          const maxT = Math.max(...trendData.map(t => Math.max(t.raised, t.resolved)), 1);

          return (
          <div className="ad-content">
            <div className="ad-charts-row">
              <div className="ad-chart-card ad-chart-card--wide">
                <h3 className="ad-chart-title">Weekly Complaint Trend</h3>
                <p className="ad-chart-sub">Complaints raised vs resolved by day of the week</p>
                <div className="ad-bar-chart">
                  {trendData.map(t => (
                    <div key={t.day} className="ad-bar-group">
                      <div className="ad-bar-pair">
                        <div className="ad-bar ad-bar--raised"   style={{ height: `${(t.raised/maxT)*100}%` }}><span className="ad-bar-tip">{t.raised}</span></div>
                        <div className="ad-bar ad-bar--resolved" style={{ height: `${(t.resolved/maxT)*100}%` }}><span className="ad-bar-tip">{t.resolved}</span></div>
                      </div>
                      <span className="ad-bar-day">{t.day}</span>
                    </div>
                  ))}
                </div>
                <div className="ad-bar-legend">
                  <span><span className="ad-legend-dot" style={{background:'#667eea'}}/>Raised</span>
                  <span><span className="ad-legend-dot" style={{background:'#10b981'}}/>Resolved</span>
                </div>
              </div>
              <div className="ad-chart-card">
                <h3 className="ad-chart-title">Performance by In-Charge</h3>
                <p className="ad-chart-sub">Resolution rate per block</p>
                <div className="ad-cat-list">
                  {incharges.filter(u=>u.complaints>0).map(u => (
                    <div key={u.name} className="ad-cat-item">
                      <div className="ad-cat-header">
                        <span className="ad-cat-name">{u.assigned_block}</span>
                        <span className="ad-cat-count">{u.complaints > 0 ? Math.round((u.resolved/u.complaints)*100) : 0}%</span>
                      </div>
                      <div className="ad-cat-bar-bg">
                        <div className="ad-cat-bar-fill" style={{ width: `${u.complaints > 0 ? (u.resolved/u.complaints)*100 : 0}%`, background: '#667eea' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ad-chart-card" style={{width:'100%'}}>
              <h3 className="ad-chart-title">Block Heatmap — Complaints Concentration</h3>
              <p className="ad-chart-sub">Higher count = darker shade</p>
              <div className="ad-heatmap">
                {Object.entries(complaints.reduce((acc,c) => { acc[c.block] = (acc[c.block]||0)+1; return acc; }, {}))
                  .sort((a,b)=>b[1]-a[1])
                  .map(([block, cnt]) => {
                    const intensity = Math.min(cnt/4, 1);
                    return (
                      <div key={block} className="ad-heatmap-cell" style={{ background: `rgba(102,126,234,${0.1 + intensity*0.7})` }}>
                        <span className="ad-heatmap-block">{block}</span>
                        <span className="ad-heatmap-count">{cnt}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── Settings ───────────────────────────────── */}
        {activeNav === 'settings' && (
          <div className="ad-content">
            <div className="ad-settings-grid">
              {[
                { title:'System Notifications', desc:'Configure email & SMS alerts for new complaints and status changes.', icon:'🔔', action:'Configure' },
                { title:'Priority Rules',       desc:'Set auto-escalation rules based on complaint age and category.', icon:'⚡', action:'Edit Rules' },
                { title:'NLP Model Settings',   desc:'Adjust AI classification thresholds and spam detection sensitivity.', icon:'🤖', action:'Tune Model' },
                { title:'User Management',      desc:'Add, remove, or reassign in-charges to blocks and floors.', icon:'👥', action:'Manage Users', nav:'users' },
                { title:'Data Export',          desc:'Export complaint logs, analytics data and audit trails as CSV/PDF.', icon:'📤', action:'Export Data' },
                { title:'Audit Log',            desc:'Full trail of all admin actions and system events.', icon:'📜', action:'View Logs' },
              ].map(s => (
                <div key={s.title} className="ad-setting-card">
                  <div className="ad-setting-icon">{s.icon}</div>
                  <div className="ad-setting-body">
                    <h4 className="ad-setting-title">{s.title}</h4>
                    <p className="ad-setting-desc">{s.desc}</p>
                  </div>
                  <button className="ad-setting-btn" onClick={() => s.nav && setActiveNav(s.nav)}>{s.action} →</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Complaint detail modal ──────────────────────── */}
      {selected && (
        <div className="ad-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <div>
                <span className="ad-modal-id">{selected.id}</span>
                <h2 className="ad-modal-title">{selected.title}</h2>
              </div>
              <button className="ad-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="ad-modal-grid">
              {[
                ['Student', `${selected.student} (${selected.rollNo})`],
                ['Location', selected.block],
                ['In-Charge', selected.incharge],
                ['Filed On', selected.date],
                ['Category', selected.category],
                ['Priority', selected.priority],
              ].map(([k,v]) => (
                <div key={k} className="ad-meta-item">
                  <span className="ad-meta-key">{k}</span>
                  <span className="ad-meta-val">{v}</span>
                </div>
              ))}
              <div className="ad-meta-item">
                <span className="ad-meta-key">Status</span>
                <span className="ad-tag" style={{ color: STATUS_COLOR[selected.status], background: STATUS_BG[selected.status] }}>{selected.status}</span>
              </div>
              <div className="ad-meta-item">
                <span className="ad-meta-key">Sentiment</span>
                <span className="ad-tag" style={{ color: SENTIMENT_COLOR[selected.sentiment], background: '#f8faff' }}>{selected.sentiment}</span>
              </div>
            </div>
            <div className="ad-modal-actions">
              {selected.status !== 'Resolved' && (
                <button className="ad-action-btn ad-action-btn--resolve ad-modal-btn" onClick={() => updateStatus(selected.id, 'Resolved')}>✓ Mark Resolved</button>
              )}
              {selected.status === 'Pending' && (
                <button className="ad-action-btn ad-action-btn--progress ad-modal-btn" onClick={() => updateStatus(selected.id, 'In Progress')}>▶ In Progress</button>
              )}
              <button className="ad-action-btn ad-action-btn--close ad-modal-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add In-Charge modal ─────────────────────────── */}
      {showAddIC && (
        <div className="ad-modal-overlay" onClick={() => setShowAddIC(false)}>
          <div className="ad-modal ad-modal--form" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2 className="ad-modal-title">Add New In-Charge</h2>
              <button className="ad-modal-close" onClick={() => setShowAddIC(false)}>✕</button>
            </div>
            <div className="ad-form-grid">
              {[
                { label:'Full Name *',    key:'name',        placeholder:'e.g. Mr. Raj Kumar', type:'text' },
                { label:'College Email *',key:'email',       placeholder:'raj@campuspulse.edu', type:'email' },
                { label:'Phone',          key:'phone',       placeholder:'10-digit mobile',     type:'tel' },
                { label:'Designation',    key:'designation', placeholder:'e.g. Senior In-Charge',type:'text' },
              ].map(f => (
                <div key={f.key} className="ad-form-group">
                  <label className="ad-form-label">{f.label}</label>
                  <input className="ad-form-input" type={f.type} placeholder={f.placeholder}
                    value={newIC[f.key]} onChange={e => setNewIC(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="ad-form-group ad-form-group--full">
                <label className="ad-form-label">Assign Block *</label>
                <select className="ad-form-input" value={newIC.block} onChange={e => setNewIC(p => ({ ...p, block: e.target.value }))}>
                  {BLOCKS_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-action-btn ad-action-btn--resolve ad-modal-btn" onClick={addIncharge}>✓ Add In-Charge</button>
              <button className="ad-action-btn ad-action-btn--close ad-modal-btn" onClick={() => setShowAddIC(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reassign modal ──────────────────────────────── */}
      {reassignTarget && (
        <div className="ad-modal-overlay" onClick={() => setReassignTarget(null)}>
          <div className="ad-modal ad-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2 className="ad-modal-title">Reassign In-Charge</h2>
              <button className="ad-modal-close" onClick={() => setReassignTarget(null)}>✕</button>
            </div>
            <p style={{padding:'0 1.5rem', fontSize:'0.88rem', color:'#64748b', marginBottom:'1rem'}}>
              Moving <strong>{reassignTarget.name}</strong> from <strong>{reassignTarget.assigned_block}</strong> to:
            </p>
            <div className="ad-form-group" style={{padding:'0 1.5rem', marginBottom:'1.5rem'}}>
              <label className="ad-form-label">New Block</label>
              <select className="ad-form-input" value={reassignBlock} onChange={e => setReassignBlock(e.target.value)}>
                {BLOCKS_LIST.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-action-btn ad-action-btn--resolve ad-modal-btn" onClick={doReassign}>✓ Confirm Reassign</button>
              <button className="ad-action-btn ad-action-btn--close ad-modal-btn" onClick={() => setReassignTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove confirm modal ────────────────────────── */}
      {removeTarget && (
        <div className="ad-modal-overlay" onClick={() => setRemoveTarget(null)}>
          <div className="ad-modal ad-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2 className="ad-modal-title" style={{color:'#ef4444'}}>⚠️ Remove In-Charge</h2>
              <button className="ad-modal-close" onClick={() => setRemoveTarget(null)}>✕</button>
            </div>
            <p style={{padding:'0.5rem 1.5rem 1.5rem', fontSize:'0.9rem', color:'#64748b'}}>
              Are you sure you want to permanently remove <strong>{removeTarget.name}</strong> from <strong>{removeTarget.assigned_block}</strong>? This action cannot be undone.
            </p>
            <div className="ad-modal-actions">
              <button className="ad-action-btn ad-modal-btn" style={{background:'#ef4444',color:'white'}} onClick={() => removeIncharge(removeTarget.id)}>🗑 Remove Permanently</button>
              <button className="ad-action-btn ad-action-btn--close ad-modal-btn" onClick={() => setRemoveTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Generated Credentials Modal ────────────────── */}
      {generatedCreds && (
        <div className="ad-modal-overlay" onClick={() => setGeneratedCreds(null)}>
          <div className="ad-modal ad-modal--form" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <div>
                <h2 className="ad-modal-title" style={{color:'#10b981'}}>✅ In-Charge Created</h2>
                <p style={{fontSize:'0.82rem',color:'#94a3b8',marginTop:2}}>Credentials successfully generated</p>
              </div>
              <button className="ad-modal-close" onClick={() => setGeneratedCreds(null)}>✕</button>
            </div>
            <div style={{padding:'1.5rem', background:'#f0fdf4', margin:'0 1.5rem 1.5rem', borderRadius:'12px', border:'1px solid #bbf7d0'}}>
               <p style={{marginBottom:'1rem', fontSize:'0.9rem'}}>Please share these credentials with <strong>{generatedCreds.name}</strong>. They will be required to change their password on first login.</p>
               <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                  <div><span style={{fontWeight:600, width:100, display:'inline-block'}}>Email:</span> <code>{generatedCreds.email}</code></div>
                  <div><span style={{fontWeight:600, width:100, display:'inline-block'}}>Password:</span> <code style={{fontSize:'1.1rem', color:'#059669', background:'white', padding:'2px 8px', borderRadius:4}}>{generatedCreds.tempPassword}</code></div>
                  <div><span style={{fontWeight:600, width:100, display:'inline-block'}}>Employee ID:</span> <code>{generatedCreds.employeeId}</code></div>
                  <div><span style={{fontWeight:600, width:100, display:'inline-block'}}>Block:</span> <code>{generatedCreds.block}</code></div>
               </div>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-action-btn ad-action-btn--resolve ad-modal-btn" onClick={() => setGeneratedCreds(null)}>Done</button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

/* ── Shared table renderer ───────────────────────────────── */
function renderTable(rows, updateStatus, setSelected, showIncharge) {
  const PRIORITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const PRIORITY_BG    = { High: '#fef2f2', Medium: '#fffbeb', Low: '#ecfdf5' };
  const STATUS_COLOR   = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Resolved: '#10b981' };
  const STATUS_BG      = { Pending: '#fffbeb', 'In Progress': '#eff6ff', Resolved: '#ecfdf5' };

  return (
    <div className="ad-table-wrap">
      <div className={`ad-table-header ${showIncharge ? 'ad-col-7' : 'ad-col-6'}`}>
        <span>Complaint</span><span>Category</span><span>Block</span>
        {showIncharge && <span>In-Charge</span>}
        <span>Priority</span><span>Status</span><span>Actions</span>
      </div>
      <div className="ad-table-body">
        {rows.length === 0 && <div className="ad-empty">No complaints found.</div>}
        {rows.map(c => (
          <div key={c.id} className={`ad-table-row ${showIncharge ? 'ad-col-7' : 'ad-col-6'}`} onClick={() => setSelected(c)}>
            <div className="ad-col-complaint">
              <span className="ad-complaint-id">{c.id}</span>
              <span className="ad-complaint-title">{c.title}</span>
              <span className="ad-complaint-student">👤 {c.student?.name || 'Unknown'}</span>
            </div>
            <span className="ad-tag" style={{ background:'#eef2ff', color:'#667eea' }}>{c.category}</span>
            <span className="ad-col-block">{c.block}</span>
            {showIncharge && <span className="ad-col-ic">{c.assigned_incharge?.name || 'Unassigned'}</span>}
            <span className="ad-tag" style={{ color: PRIORITY_COLOR[c.priority], background: PRIORITY_BG[c.priority] }}>{c.priority}</span>
            <span className="ad-tag" style={{ color: STATUS_COLOR[c.status],   background: STATUS_BG[c.status] }}>{c.status}</span>
            <div className="ad-actions" onClick={e => e.stopPropagation()}>
              {c.status !== 'Resolved' && (
                <button className="ad-action-btn ad-action-btn--resolve" onClick={() => updateStatus(c.id, 'Resolved')}>✓</button>
              )}
              {c.status === 'Pending' && (
                <button className="ad-action-btn ad-action-btn--progress" onClick={() => updateStatus(c.id, 'In Progress')}>▶</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
