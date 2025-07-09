// src/renderer/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PinCodePage from './pages/PinCodePage';
import HomePage from './pages/HomePage';
import TakeAwayPage from './pages/TakeAwayPage';
import DineInPage from './pages/DineInPage';
import MenuPage from './pages/MenuPage';
import StaffPage from './pages/StaffPage';
import SettingsPage from './pages/SettingsPage';
import SalesPage from './pages/SalesPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* redirect root hash → /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* your actual pages */}
        <Route path="/pin" element={<PinCodePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/takeaway" element={<TakeAwayPage />} />
        <Route path="/dinein" element={<DineInPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/sales" element={<SalesPage />} />


        {/* catch‑all: any unknown hash → /home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
