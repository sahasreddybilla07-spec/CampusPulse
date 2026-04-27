import { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '../services/admin';
import Navbar from './Navbar';
import Logo from './Logo';
import './PublicAnalytics.css';

/* ── Data ───────────────────────────────────── */
const CAT_COLORS = ['#667eea', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#ef4444', '#06b6d4', '#f97316'];
const BLOCK_COLORS = ['#667eea','#3b82f6','#10b981','#a855f7','#f59e0b','#ef4444','#06b6d4','#84cc16','#f97316','#ec4899','#8b5cf6','#14b8a6','#f43f5e','#0ea5e9','#d97706','#65a30d'];

function getChartData(analytics) {
  if (!analytics) return { categories: [], priorities: [], blocks: [], trend: [] };

  const catObj = analytics.byCategory || {};
  const categories = Object.entries(catObj).map(([label, count], i) => ({
    label, count: count || 0, color: CAT_COLORS[i % CAT_COLORS.length], 
    pct: Math.round(((count || 0) / (analytics.total || 1)) * 100)
  }));

  const priObj = analytics.byPriority || {};
  const priorities = Object.entries(priObj).map(([label, count]) => ({
    label, count: count || 0, 
    color: label === 'High' ? '#ef4444' : label === 'Medium' ? '#f59e0b' : '#10b981',
    pct: Math.round(((count || 0) / (analytics.total || 1)) * 100)
  }));

  const blockArr = Array.isArray(analytics.byBlock) ? analytics.byBlock : [];
  const blocks = blockArr.slice(0, 16).map((b, i) => ({
    block: b.block || 'Unknown', complaints: b.total || 0, resolved: b.resolved || 0,
    color: BLOCK_COLORS[i % BLOCK_COLORS.length]
  }));

  const trend = Array.isArray(analytics.byDay) ? analytics.byDay : [];

  return { categories, priorities, blocks, trend };
}

/* ── SVG Donut chart helper ─────────────────── */
function DonutChart({ slices, size = 160, thickness = 32 }) {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let cumulativeDeg = -90; // start from 12 o'clock

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      {slices.map((s, i) => {
        const angle = cumulativeDeg;
        const dash  = (s.pct / 100) * circ;
        cumulativeDeg += (s.pct / 100) * 360;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={0}
            transform={`rotate(${angle}, ${cx}, ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

/* ── Heatmap data ───────────────────────────── */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MAX_HEAT = 3;

export default function PublicAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAnalyticsSummary();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return <div className="pa-loading">Loading Campus Insights…</div>;
  }

  // Handle empty or failed analytics gracefully
  const safeAnalytics = analytics && typeof analytics === 'object' ? analytics : { total: 0, resolved: 0, pending: 0, inProgress: 0 };

  const { categories, priorities, blocks, trend } = getChartData(safeAnalytics);
  const totalComplaints = safeAnalytics.total || 0;
  const totalResolved   = safeAnalytics.resolved || 0;
  const resRate         = totalComplaints > 0 ? Math.round((totalResolved / totalComplaints) * 100) : 0;
  const avgResTime      = safeAnalytics.avgDays ? `${safeAnalytics.avgDays} days` : 'N/A';
  
  const maxTrend = trend.length > 0 ? Math.max(...trend.map(t => Math.max(t.raised || 0, t.resolved || 0)), 1) : 1;
  const maxBlock = blocks.length > 0 ? Math.max(...blocks.map(b => b.complaints || 0), 1) : 1;


  return (
    <div className="pa-root">
      <Navbar />

      {/* Hero */}
      <div className="pa-hero">
        <div className="pa-hero-inner">
          <div style={{ filter: 'brightness(0) invert(1) opacity(0.75)', marginBottom: '0.5rem' }}>
            <Logo />
          </div>
          <span className="pa-hero-badge">📊 Public Analytics</span>
          <h1 className="pa-hero-title">Campus Insights</h1>
          <p className="pa-hero-sub">Real-time analytics on complaint trends, resolution rates, and block-level performance across campus.</p>

          {/* Tab switcher inside hero */}
          <div className="pa-tabs">
            {['overview','trends','blocks'].map(t => (
              <button
                key={t}
                className={`pa-tab ${activeTab === t ? 'pa-tab--active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pa-content">

        {/* KPI Strip */}
        <div className="pa-kpi-row">
          {[
            { label: 'Total Complaints',  value: totalComplaints, icon: '📋', color: '#667eea', bg: '#eef2ff'  },
            { label: 'Resolved',          value: totalResolved,   icon: '✅', color: '#10b981', bg: '#ecfdf5'  },
            { label: 'Resolution Rate',   value: `${resRate}%`,   icon: '📈', color: '#3b82f6', bg: '#eff6ff'  },
            { label: 'Avg. Resolution',   value: avgResTime,      icon: '⏱️', color: '#f59e0b', bg: '#fffbeb'  },
          ].map(k => (
            <div key={k.label} className="pa-kpi-card">
              <div className="pa-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              <div>
                <p className="pa-kpi-value">{k.value}</p>
                <p className="pa-kpi-label">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── OVERVIEW tab ─────────────────────── */}
        {activeTab === 'overview' && (
          <>
        {/* Row 1: two donuts */}
        <div className="pa-row">

          {/* Donut — Category breakdown */}
          <div className="pa-card">
            <h3 className="pa-card-title">Complaints by Category</h3>
            <p className="pa-card-sub">Distribution of complaint types</p>
            <div className="pa-donut-wrap">
              <div className="pa-donut-chart">
                <DonutChart slices={categories} size={180} thickness={36} />
                <div className="pa-donut-center">
                  <span className="pa-donut-num">{totalComplaints}</span>
                  <span className="pa-donut-sub">Total</span>
                </div>
              </div>
              <div className="pa-donut-legend">
                {categories.map(c => (
                  <div key={c.label} className="pa-legend-row">
                    <span className="pa-legend-dot" style={{ background: c.color }} />
                    <span className="pa-legend-label">{c.label}</span>
                    <span className="pa-legend-val">{c.count}</span>
                    <span className="pa-legend-pct">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Donut — Priority breakdown */}
          <div className="pa-card">
            <h3 className="pa-card-title">Priority Distribution</h3>
            <p className="pa-card-sub">High / Medium / Low complaints</p>
            <div className="pa-donut-wrap">
              <div className="pa-donut-chart">
                <DonutChart slices={priorities} size={180} thickness={36} />
                <div className="pa-donut-center">
                  <span className="pa-donut-num">{totalComplaints}</span>
                  <span className="pa-donut-sub">Issues</span>
                </div>
              </div>
              <div className="pa-donut-legend">
                {priorities.map(p => (
                  <div key={p.label} className="pa-legend-row">
                    <span className="pa-legend-dot" style={{ background: p.color }} />
                    <span className="pa-legend-label">{p.label}</span>
                    <span className="pa-legend-val">{p.count}</span>
                    <span className="pa-legend-pct">{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: resolution donut + insight */}
        <div className="pa-row">
          {/* Donut — Resolution status */}
          <div className="pa-card">
            <h3 className="pa-card-title">Resolution Status</h3>
            <p className="pa-card-sub">Current state of all complaints</p>
            <div className="pa-donut-wrap">
              <div className="pa-donut-chart">
                <DonutChart
                  slices={[
                    { label:'Resolved',    count: totalResolved, color:'#10b981', pct: Math.round((totalResolved / (totalComplaints || 1)) * 100) },
                    { label:'In Progress', count: safeAnalytics.inProgress || 0, color:'#3b82f6', pct: Math.round(((safeAnalytics.inProgress || 0) / (totalComplaints || 1)) * 100) },
                    { label:'Pending',     count: safeAnalytics.pending || 0, color:'#f59e0b', pct: Math.round(((safeAnalytics.pending || 0) / (totalComplaints || 1)) * 100) },
                  ]}
                  size={180} thickness={36}
                />
                <div className="pa-donut-center">
                  <span className="pa-donut-num">{resRate}%</span>
                  <span className="pa-donut-sub">Resolved</span>
                </div>
              </div>
              <div className="pa-donut-legend">
                {[
                  { label:'Resolved',    count: totalResolved, color:'#10b981', pct: Math.round((totalResolved / (totalComplaints || 1)) * 100) },
                  { label:'In Progress', count: safeAnalytics.inProgress || 0, color:'#3b82f6', pct: Math.round(((safeAnalytics.inProgress || 0) / (totalComplaints || 1)) * 100) },
                  { label:'Pending',     count: safeAnalytics.pending || 0, color:'#f59e0b', pct: Math.round(((safeAnalytics.pending || 0) / (totalComplaints || 1)) * 100) },
                ].map(s => (
                  <div key={s.label} className="pa-legend-row">
                    <span className="pa-legend-dot" style={{ background: s.color }} />
                    <span className="pa-legend-label">{s.label}</span>
                    <span className="pa-legend-val">{s.count}</span>
                    <span className="pa-legend-pct">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly resolution progress — second card in Row 2 */}
          <div className="pa-card">
            <h3 className="pa-card-title">Resolution Summary</h3>
            <p className="pa-card-sub">Current complaint resolution overview</p>
            <div className="pa-insight-box" style={{marginTop:'1rem'}}>
              <span className="pa-insight-icon">💡</span>
              <div>
                <p className="pa-insight-title">Current Status</p>
                <p className="pa-insight-desc">
                  <strong>{totalResolved}</strong> resolved out of <strong>{totalComplaints}</strong> total complaints ({resRate}% resolution rate). 
                  Average resolution time: <strong>{avgResTime}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>{/* end Row 2 */}
        </>
        )}

        {/* ── TRENDS tab ───────────────────────── */}
        {activeTab === 'trends' && (
          <>
            {/* Weekly bar chart */}
            <div className="pa-card pa-card--full">
              <h3 className="pa-card-title">Weekly Complaint Trend</h3>
              <p className="pa-card-sub">Complaints raised vs resolved this week</p>
              <div className="pa-bar-chart">
                {trend.map(t => (
                  <div key={t.day} className="pa-bar-group">
                    <div className="pa-bar-pair">
                      <div className="pa-bar pa-bar--raised" style={{ height: `${(t.raised/maxTrend)*100}%` }}>
                        <span className="pa-bar-tip">{t.raised}</span>
                      </div>
                      <div className="pa-bar pa-bar--resolved" style={{ height: `${(t.resolved/maxTrend)*100}%` }}>
                        <span className="pa-bar-tip">{t.resolved}</span>
                      </div>
                    </div>
                    <span className="pa-bar-day">{t.day}</span>
                  </div>
                ))}
              </div>
              <div className="pa-legend">
                <span><span className="pa-dot" style={{ background:'#667eea' }}/>Raised</span>
                <span><span className="pa-dot" style={{ background:'#10b981' }}/>Resolved</span>
              </div>
            </div>

            {/* Monthly resolution progress */}
            <div className="pa-card pa-card--full">
              <h3 className="pa-card-title">Resolution Performance</h3>
              <p className="pa-card-sub">Current status of all campus requests</p>
              <div className="pa-monthly-bars" style={{ height: '200px', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                {[
                  { label: 'Pending', count: safeAnalytics.pending || 0, color: '#f59e0b' },
                  { label: 'In Progress', count: safeAnalytics.inProgress || 0, color: '#3b82f6' },
                  { label: 'Resolved', count: safeAnalytics.resolved || 0, color: '#10b981' },
                ].map(s => (
                  <div key={s.label} className="pa-monthly-col">
                    <div className="pa-monthly-bar-wrap" style={{ height: '100%', width: '60px' }}>
                      <div className="pa-monthly-bar" style={{ height: `${(s.count / (totalComplaints || 1)) * 100}%`, background: s.color }}>
                        <span className="pa-monthly-bar-tip">{s.count}</span>
                      </div>
                    </div>
                    <span className="pa-monthly-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── BLOCKS tab ───────────────────────── */}
        {activeTab === 'blocks' && (
          <>
            {/* Heatmap */}


            {/* Block comparison bars */}
            <div className="pa-card pa-card--full">
              <h3 className="pa-card-title">Complaints by Block</h3>
              <p className="pa-card-sub">Raised vs resolved per block</p>
              <div className="pa-block-chart">
                {blocks.map(b => (
                  <div key={b.block} className="pa-block-row">
                    <span className="pa-block-name">{b.block}</span>
                    <div className="pa-block-bars">
                      <div className="pa-block-bg">
                        <div className="pa-block-raised" style={{ width:`${(b.complaints/maxBlock)*100}%`, background:b.color }} />
                      </div>
                      <div className="pa-block-bg">
                        <div className="pa-block-resolved" style={{ width:`${(b.resolved/maxBlock)*100}%` }} />
                      </div>
                    </div>
                    <div className="pa-block-nums-wrap">
                      <span className="pa-block-nums">{b.resolved}/{b.complaints}</span>
                      <span className="pa-block-rate">{b.complaints > 0 ? Math.round((b.resolved/b.complaints)*100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pa-legend" style={{marginTop:'1rem'}}>
                <span><span className="pa-dot" style={{background:'#667eea'}}/>Raised</span>
                <span><span className="pa-dot" style={{background:'#10b981'}}/>Resolved</span>
              </div>
            </div>
          </>
        )}



        {/* Footer note */}
        <div className="pa-note">
          <span>🔒</span>
          <span>Data is anonymised. Personal details are not disclosed publicly. For detailed admin analytics, use the Admin Dashboard.</span>
        </div>

      </div>
    </div>
  );
}
