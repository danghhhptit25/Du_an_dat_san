import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import AdminStatsPage from './pages/AdminStatsPage';
import './pages/CourtBooking.css';
import CheckoutBookingPage from './pages/CheckoutBookingPage';
import CourtDetailPage from './pages/CourtDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <header className="navbar">
        <NavLink to="/booking" className="navbar-brand">
          <div className="brand-icon">📅</div>
          <span>Đặt Sân</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/booking">Danh sách sân</NavLink>
          <NavLink to="/history">Lịch sử đặt sân</NavLink>
          <NavLink to="/admin/stats">Thống kê Admin</NavLink>
        </nav>

        <div className="navbar-user">
          <span>👤 Hoàng Hữu Hải Đăng</span>
          <button className="btn-logout">↪ Đăng xuất</button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/booking" replace />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/history" element={<BookingHistoryPage />} />
        <Route path="/admin/stats" element={<AdminStatsPage />} />
        <Route path="/courts/:id" element={<CourtDetailPage />} />
        <Route path="/checkout" element={<CheckoutBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
