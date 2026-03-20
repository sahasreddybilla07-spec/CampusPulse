import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import SubmitComplaint from './components/SubmitComplaint';
import Analytics from './components/Analytics';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaints" element={<div>Complaints Page - Coming Soon</div>} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Student section (existing login/register behavior) */}
          <Route path="/student/login" element={<Login />} />
          <Route path="/student/register" element={<Signup />} />

          {/* Legacy routes redirect to student section */}
          <Route path="/login" element={<Navigate to="/student/login" replace />} />
          <Route path="/signup" element={<Navigate to="/student/register" replace />} />

          <Route path="/submit-complaint" element={<SubmitComplaint />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;