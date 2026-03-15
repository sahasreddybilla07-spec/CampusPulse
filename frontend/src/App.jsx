import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import SubmitComplaint from './components/SubmitComplaint';
import UserLogin from './components/UserLogin';
import UserRegister from './components/UserRegister';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaints" element={<div>Complaints Page - Coming Soon</div>} />
          <Route path="/analytics" element={<div>Analytics Page - Coming Soon</div>} />
          {/* Student section (existing login/register behavior) */}
          <Route path="/student/login" element={<Login />} />
          <Route path="/student/register" element={<Signup />} />

          {/* Legacy routes redirect to student section */}
          <Route path="/login" element={<Navigate to="/student/login" replace />} />
          <Route path="/signup" element={<Navigate to="/student/register" replace />} />

          {/* User section */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />

          <Route path="/submit-complaint" element={<SubmitComplaint />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;