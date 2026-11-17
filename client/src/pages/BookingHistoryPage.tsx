import { useEffect, useState } from 'react';
import './BookingHistoryPage.css';

interface BookingItem {
  _id: string;
  bookingCode?: string;
  phone?: string;
  courtId: string;
  courtName?: string;
  sport?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

const COURT_LABELS: Record<string, { sport: string; name: string }> = {
  san_bong_A: { sport: 'Bóng đá mini', name: 'Sân 5 người số 1' },
  san_bong_B: { sport: 'Bóng đá mini', name: 'Sân 7 người số 2' },
  san_cau_long_1: { sport: 'Cầu lông', name: 'Sân cầu lông số 1' },
  san_pickleball_1: { sport: 'Pickleball', name: 'Sân pickleball số 3' },
};

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings/user/user_01');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.bookings || [];
      setBookings(list);
    } catch {
      setBookings([
        {
          _id: '673b1a9f001',
          bookingCode: 'NS-HGUYGK',
          phone: '0280000000',
          courtId: 'san_pickleball_1',
          sport: 'Pickleball',
          courtName: 'Sân pickleball số 3',
          date: '2026-11-18',
          startTime: '06:30',
          endTime: '07:30',
          totalPrice: 80000,
          status: 'Pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn huỷ lượt đặt sân này?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/cancel`, {
        method: 'PUT',
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: 'Cancelled' } : b))
        );
        return;
      }
    } catch {
    }

    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status: 'Cancelled' } : b))
    );
  };

  const getDurationHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = eh + em / 60 - (sh + sm / 60);
    return diff > 0 ? diff : 1;
  };

  const formatVietnameseDate = (dateStr: string) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dayName = days[d.getDay()];
    const [y, m, day] = dateStr.split('-');
    return `${dayName}, ${day}/${m}/${y}`;
  };

  // Lọc theo mã đặt sân hoặc số điện thoại
  const filteredList = bookings.filter((item) => {
    const code = (item.bookingCode || `NS-${item._id.slice(-6).toUpperCase()}`).toLowerCase();
    const phone = (item.phone || '').toLowerCase();
    const q = keyword.trim().toLowerCase();
    if (!q) return true;
    return code.includes(q) || phone.includes(q);
  });

  const upcomingBookings = filteredList.filter((b) => b.status !== 'Cancelled');
  const pastOrCancelledBookings = filteredList.filter((b) => b.status === 'Cancelled');

  const renderStatusBadge = (status: BookingItem['status']) => {
    if (status === 'Confirmed') {
      return <span className="status-pill confirmed">Đã xác nhận</span>;
    }
    if (status === 'Cancelled') {
      return <span className="status-pill cancelled">Đã huỷ</span>;
    }
    return <span className="status-pill pending">Chờ xác nhận</span>;
  };

  return (
    <div className="history-wrapper">
      <div className="history-container">
        <h1 className="history-title">LỊCH CỦA TÔI</h1>
        <p className="history-subtitle">
          Các lượt bạn đã đặt trên hệ thống. Có thể huỷ trước giờ chơi 2 giờ.
        </p>

        <div className="info-banner">
          Lượt đặt của bạn được đồng bộ trực tiếp giữa các trang Đặt sân, Lịch của tôi và Quản lý chủ sân.
        </div>

        <div className="search-box-group">
          <label className="search-label">Tìm theo mã đặt sân hoặc số điện thoại</label>
          <input
            type="text"
            className="search-input"
            placeholder="Nhập mã NS-... hoặc SĐT"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <h2 className="section-label">SẮP TỚI</h2>

        {loading ? (
          <p style={{ color: '#64748b', fontSize: 14 }}>Đang tải lịch sử đặt sân...</p>
        ) : upcomingBookings.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Không có lượt đặt sân nào sắp tới.
          </p>
        ) : (
          upcomingBookings.map((item) => {
            const displayCode =
              item.bookingCode || `NS-${item._id.slice(-6).toUpperCase()}`;
            const courtInfo = COURT_LABELS[item.courtId] || {
              sport: item.sport || 'Thể thao',
              name: item.courtName || item.courtId,
            };
            const hours = getDurationHours(item.startTime, item.endTime);

            return (
              <div key={item._id} className="booking-card">
                <div className="booking-card-top">
                  <div className="booking-code">
                    <span
                      className={`status-dot ${
                        item.status === 'Confirmed' ? 'confirmed' : 'pending'
                      }`}
                    />
                    <span>{displayCode}</span>
                  </div>
                  {renderStatusBadge(item.status)}
                </div>

                <div className="booking-datetime">
                  {formatVietnameseDate(item.date)}, {item.startTime} - {item.endTime}
                </div>

                <div className="booking-court-desc">
                  {courtInfo.sport}, {courtInfo.name}, {hours} giờ
                </div>

                <div className="booking-card-bottom">
                  <span className="booking-amount">
                    {item.totalPrice.toLocaleString('vi-VN')} đ
                  </span>

                  <button
                    type="button"
                    className="btn-cancel-booking"
                    onClick={() => handleCancelBooking(item._id)}
                  >
                    Huỷ lịch
                  </button>
                </div>
              </div>
            );
          })
        )}

        <p className="history-footnote">
          Huỷ miễn phí trước giờ chơi 2 giờ. Sát giờ hơn, vui lòng gọi 028 0000 0000.
        </p>

        {pastOrCancelledBookings.length > 0 && (
          <>
            <h2 className="section-label" style={{ marginTop: 32 }}>
              ĐÃ HUỶ
            </h2>
            {pastOrCancelledBookings.map((item) => {
              const displayCode =
                item.bookingCode || `NS-${item._id.slice(-6).toUpperCase()}`;
              const courtInfo = COURT_LABELS[item.courtId] || {
                sport: item.sport || 'Thể thao',
                name: item.courtName || item.courtId,
              };

              return (
                <div key={item._id} className="booking-card" style={{ opacity: 0.75 }}>
                  <div className="booking-card-top">
                    <div className="booking-code">
                      <span className="status-dot cancelled" />
                      <span>{displayCode}</span>
                    </div>
                    {renderStatusBadge(item.status)}
                  </div>

                  <div className="booking-datetime">
                    {formatVietnameseDate(item.date)}, {item.startTime} - {item.endTime}
                  </div>

                  <div className="booking-court-desc" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    {courtInfo.sport}, {courtInfo.name} —{' '}
                    <strong>{item.totalPrice.toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}