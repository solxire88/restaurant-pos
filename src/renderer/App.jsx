import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PinCodePage from './pages/PinCodePage';
import HomePage from './pages/HomePage';
import TakeAwayPage from './pages/TakeAwayPage';
import DineInPage from './pages/DineInPage';
import MenuPage from './pages/MenuPage';
import StaffPage from './pages/StaffPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/pin" element={<PinCodePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/takeaway" element={<TakeAwayPage />} />
        <Route path="/dinein" element={<DineInPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/staff" element={<StaffPage />} />
      </Routes>
    </Router>
  );
}

export default App;
