import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCourtId, setDate, toggleSlot, clearCart } from '../store/bookingSlice';
import  { type TimeSlot } from '../types/booking';
import './CourtBooking.css';

interface CourtItem {
  id: string;
  name: string;
  sport: string;
  address: string;
  pricePerHour: number;
  rating: number;
  reviews: number;
}

const COURTS_DATA: CourtItem[] = [
  {
    id: 'san_bong_A',
    name: 'Sân Bóng Đá Mini 5 Người',
    sport: 'Bóng Đá',
    address: 'Quận 5, TP.HCM',
    pricePerHour: 200000,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'san_bong_B',
    name: 'Sân Bóng Đá Mini 7 Người',
    sport: 'Bóng Đá',
    address: 'Quận 5, TP.HCM',
    pricePerHour: 300000,
    rating: 4.8,
    reviews: 12,
  },
  {
    id: 'san_cau_long_1',
    name: 'Sân Cầu Lông Tiêu Chuẩn 1',
    sport: 'Cầu Lông',
    address: 'Quận Hà Đông, Hà Nội',
    pricePerHour: 100000,
    rating: 4.5,
    reviews: 8,
  },
];

export default function BookingPage() {
  const dispatch = useAppDispatch();
  const { selectedCourtId, selectedDate, cartSlots } = useAppSelector(
    (state) => state.booking
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('Bóng Đá');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredCourts = COURTS_DATA.filter((court) => {
    const matchName = court.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSport = sportFilter === 'Tất cả' || court.sport === sportFilter;
    return matchName && matchSport;
  });

  const activeCourt = COURTS_DATA.find((c) => c.id === selectedCourtId) || COURTS_DATA[0];
  const totalPrice = cartSlots.reduce((sum, item) => sum + item.price, 0);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/available?courtId=${selectedCourtId}&date=${selectedDate}`
      );
      const data = await res.json();
      setSlots(data);
    } catch {
      setMessage({ type: 'error', text: 'Không thể kết nối tới Backend cổng 5000!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedCourtId, selectedDate]);

  const handleConfirmBooking = async () => {
    if (cartSlots.length === 0) return;

    const sorted = [...cartSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const payload = {
      customerId: 'user_01',
      courtId: selectedCourtId,
      date: selectedDate,
      startTime: sorted[0].startTime,
      endTime: sorted[sorted.length - 1].endTime,
      totalPrice,
    };

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: result.message || 'Đặt sân thất bại!' });
        return;
      }

      setMessage({ type: 'success', text: result.message });
      dispatch(clearCart());
      fetchSlots();
    } catch {
      setMessage({ type: 'error', text: 'Lỗi mạng khi gửi đơn đặt sân!' });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <h1 className="page-title">Danh sách sân</h1>

        <div className="search-filter-bar">
          <div className="search-input-group">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-divider" />

          <select
            className="sport-select"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <option value="Tất cả">🏅 Tất cả môn</option>
            <option value="Bóng Đá">⚽ Bóng Đá</option>
            <option value="Cầu Lông">🏸 Cầu Lông</option>
          </select>
        </div>

        <div className="toolbar-row">
          <span>Tìm thấy {filteredCourts.length} sân</span>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Dạng lưới"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Dạng danh sách"
            >
              ☰
            </button>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'courts-grid' : 'courts-list'}>
          {filteredCourts.map((court) => (
            <div
              key={court.id}
              className={`court-card ${selectedCourtId === court.id ? 'selected' : ''}`}
              onClick={() => {
                dispatch(setCourtId(court.id));
                setMessage(null);
              }}
            >
              <div className="court-banner">🕒</div>

              <div className="court-body">
                <div className="court-header">
                  <h3 className="court-name">{court.name}</h3>
                  <span className="sport-badge">⚽ {court.sport}</span>
                </div>

                <div className="court-address">📍 {court.address}</div>

                <div className="court-footer">
                  <div className="court-rating">
                    <span style={{ color: '#f59e0b' }}>★</span>
                    <strong>{court.rating}</strong> ({court.reviews})
                  </div>

                  <div className="price-box">
                    <span className="price-label">Từ</span>
                    <span className="price-value">
                      {court.pricePerHour.toLocaleString('vi-VN')} đ/giờ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="booking-drawer">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>
              Lịch trống: <span style={{ color: '#2563eb' }}>{activeCourt.name}</span>
            </h3>

            <div>
              <label style={{ fontWeight: 600, marginRight: 8 }}>Ngày đặt:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => dispatch(setDate(e.target.value))}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {message && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 8,
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
              }}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <p>Đang tải khung giờ từ hệ thống...</p>
          ) : (
            <div className="slots-grid">
              {slots.map((slot) => {
                const isSelected = cartSlots.some((s) => s.startTime === slot.startTime);
                return (
                  <button
                    key={slot.startTime}
                    disabled={slot.isBooked}
                    onClick={() => dispatch(toggleSlot(slot))}
                    className={`slot-btn ${slot.isBooked ? 'booked' : ''} ${
                      isSelected ? 'active' : ''
                    }`}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {slot.isBooked ? 'Đã đặt' : `${slot.price.toLocaleString('vi-VN')}đ`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              Đã chọn <strong>{cartSlots.length}</strong> khung giờ — Tổng thanh toán:{' '}
              <span style={{ color: '#2563eb', fontWeight: 700, fontSize: 18 }}>
                {totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button
              disabled={cartSlots.length === 0}
              onClick={handleConfirmBooking}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: cartSlots.length === 0 ? '#cbd5e1' : '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                cursor: cartSlots.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Xác nhận đặt sân
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}