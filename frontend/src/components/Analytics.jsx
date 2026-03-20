import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { FiTrendingUp, FiCheckCircle, FiClock, FiAlertTriangle, FiSun, FiMoon } from 'react-icons/fi';
import { MdOutlineDashboard } from 'react-icons/md';
import Navbar from './Navbar';
import './Analytics.css';

const summaryData = [
  { id: 'total', title: 'Total Complaints', value: 342, icon: <FiTrendingUp />, color: '#5de0ff', glow: '#5de0ff66' },
  { id: 'resolved', title: 'Resolved', value: 218, icon: <FiCheckCircle />, color: '#7fffd4', glow: '#7fffd466' },
  { id: 'pending', title: 'Pending', value: 96, icon: <FiClock />, color: '#ffa726', glow: '#ffa72666' },
  { id: 'high', title: 'High Priority', value: 28, icon: <FiAlertTriangle />, color: '#f06292', glow: '#f0629266' }
];

const categoryData = [
  { category: 'Hostel', value: 95 },
  { category: 'Academics', value: 74 },
  { category: 'Maintenance', value: 68 },
  { category: 'Infrastructure', value: 59 },
  { category: 'Others', value: 46 }
];

const trendData = [
  { period: 'Mon', complaints: 38 },
  { period: 'Tue', complaints: 47 },
  { period: 'Wed', complaints: 32 },
  { period: 'Thu', complaints: 54 },
  { period: 'Fri', complaints: 62 },
  { period: 'Sat', complaints: 43 },
  { period: 'Sun', complaints: 52 }
];

const statusData = [
  { name: 'Resolved', value: 218 },
  { name: 'Pending', value: 96 }
];

const heatmapData = [
  { block: 'A', score: 90 },
  { block: 'B', score: 60 },
  { block: 'C', score: 72 },
  { block: 'D', score: 45 },
  { block: 'E', score: 55 },
  { block: 'Library', score: 80 },
  { block: 'Cafeteria', score: 68 },
  { block: 'Gym', score: 33 }
];

const recentComplaints = [
  { id: 1, title: 'Water leak in block A', category: 'Maintenance', status: 'Resolved' },
  { id: 2, title: 'WiFi dropouts in library', category: 'Infrastructure', status: 'Pending' },
  { id: 7, title: 'Broken desk in classroom', category: 'Hostel', status: 'Resolved' },
  { id: 4, title: 'Projector malfunction', category: 'Academics', status: 'Pending' }
];

const palette = ['#1EB8F1', '#ED6A5A'];

export default function Analytics() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const totalComplaints = useMemo(() => summaryData.find((item) => item.id === 'total').value, []);

  return (
    <section className={`analytics-page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar />
      <div className="analytics-shell">
        <header className="analytics-header">
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Deep insights and actionable metrics from the complaint pipeline.</p>
          </div>
          <div className="stats-group">
            <div className="stats-badge">
              <MdOutlineDashboard />
              <span>{totalComplaints} Total Entries</span>
            </div>
            <button
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(prev => !prev)}
              type="button"
              aria-label="toggle light dark mode"
            >
              {isDarkMode ? <><FiSun /> Light</> : <><FiMoon /> Dark</>}
            </button>
          </div>
        </header>

        <div className="summary-row">
          {summaryData.map((card) => (
            <div key={card.id} className="summary-card" style={{ borderColor: card.color }}>
              <div className="summary-icon" style={{ color: card.color, boxShadow: `0 0 20px ${card.glow}` }}>
                {card.icon}
              </div>
              <div className="summary-info">
                <small>{card.title}</small>
                <h2>{card.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="glass-card chart-card">
            <h3>Complaints by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f4b5b" />
                <XAxis dataKey="category" stroke="#dde6f3" />
                <YAxis stroke="#dde6f3" />
                <Tooltip contentStyle={{ background: '#121b2b', borderColor: '#2f4d8f', color: '#f7f9ff' }} />
                <Bar dataKey="value" fill="#38b2ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card chart-card">
            <h3>Complaints Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <XAxis dataKey="period" stroke="#dde6f3" />
                <YAxis stroke="#dde6f3" />
                <Tooltip contentStyle={{ background: '#121b2b', borderColor: '#2f4d8f', color: '#f7f9ff' }} />
                <Line type="monotone" dataKey="complaints" stroke="#6ee7b7" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card chart-card">
            <h3>Resolved vs Pending</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.name === 'Resolved' ? '#22c55e' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#121b2b', borderColor: '#2f4d8f', color: '#f7f9ff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lower-grid">
          <div className="glass-card heatmap-card">
            <h3>Block / Location Complaint Frequency</h3>
            <div className="heatmap-grid">
              {heatmapData.map((item) => (
                <div key={item.block} className="heatmap-item" style={{ '--heat': item.score + '%' }}>
                  <h4>{item.block}</h4>
                  <p>{item.score}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card activity-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentComplaints.map((item) => (
                <div key={item.id} className="activity-row">
                  <div className="activity-data">
                    <h4>{item.title}</h4>
                    <small>{item.category}</small>
                  </div>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
