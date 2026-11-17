import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCourtId, setDate } from '../store/bookingSlice';
import { type TimeSlot } from '../types/booking';
import './CourtDetailPage.css';

const AMENITIES = ['🚗 Parking', 'Locker Room', '❄️ AC', '💡 Lighting', '🪑 Seating', '🍜 Mỳ tôm'];

const PRICING_ROWS = [
  { range: '06:00:00 - 12:00:00', price: 150000 },
  { range: '12:00:00 - 18:00:00', price: 200000 },
  { range: '18:00:00 - 22:00:00', price: 250000 },
];

const HOURS_LIST = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${h < 10 ? '0' + h : h}:00`;
});

export default function CourtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedCourtId, selectedDate } = useAppSelector((state) => state.booking);

  const activeCourtId = id || selectedCourtId || 'san_bong_A';

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) dispatch(setCourtId(id));
  }, [id, dispatch]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/available?courtId=${activeCourtId}&date=${selectedDate}`
      );
      const data = await res.json();
      setSlots(data);
    } catch {
      setMessage({ type: 'error', text: 'Không kết nối được tới server cổng 5000!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [activeCourtId, selectedDate]);

  const calculateTotal = () => {
    if (!startTime || !endTime) return 0;
    const startH = parseInt(startTime.split(':')[0], 10);
    const endH = parseInt(endTime.split(':')[0], 10);
    if (endH <= startH) return 0;

    let total = 0;
    for (let h = startH; h < endH; h++) {
      if (h < 12) total += 150000;
      else if (h < 18) total += 200000;
      else total += 250000;
    }
    return total;
  };

  const handleHourClick = (hour: string, isBooked: boolean) => {
    if (isBooked) return;
    const h = parseInt(hour.split(':')[0], 10);
    const nextH = h + 1;
    setStartTime(hour);
    setEndTime(`${nextH < 10 ? '0' + nextH : nextH}:00`);
  };

  const handleBookNow = async () => {
    const totalPrice = calculateTotal();
    if (!startTime || !endTime || totalPrice <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn giờ kết thúc lớn hơn giờ bắt đầu!' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'user_01',
          courtId: activeCourtId,
          date: selectedDate,
          startTime,
          endTime,
          totalPrice,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: result.message || 'Khung giờ đã có người đặt!' });
        return;
      }

      setMessage({ type: 'success', text: 'Đặt sân thành công!' });
      setStartTime('');
      setEndTime('');
      fetchSlots();
    } catch {
      setMessage({ type: 'error', text: 'Lỗi mạng khi gửi yêu cầu đặt sân!' });
    }
  };

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="detail-wrapper">
      <div className="detail-container">
        <div>
          <div className="detail-card">
            <img
              src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80"
              alt="Sân thể thao"
              className="court-cover-img"
            />

            <h1 className="detail-title">
              {activeCourtId === 'san_cau_long_1' ? 'Sân Cầu Lông Số 1' : `Chi tiết ${activeCourtId}`}
            </h1>

            <div className="detail-meta">
              <span>📍 Quận 1, TP.HCM</span>
              <span>
                <strong style={{ color: '#f59e0b' }}>★ 5.0</strong> (1 đánh giá)
              </span>
            </div>

            <div className="section-heading">Mô tả</div>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
              Sân thể thao chuyên nghiệp với mặt sân tiêu chuẩn cao cấp, hệ thống chiếu sáng chống chói và đầy đủ tiện ích phục vụ người chơi.
            </p>

            <div className="section-heading">Tiện ích</div>
            <div className="amenities-list">
              {AMENITIES.map((item) => (
                <span key={item} className="amenity-tag">
                  {item}
                </span>
              ))}
            </div>

            <div className="section-heading">Bảng giá</div>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Giá/giờ</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_ROWS.map((row) => (
                  <tr key={row.range}>
                    <td>{row.range}</td>
                    <td className="price-highlight">{row.price.toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-card">
            <h3 style={{ margin: '0 0 14px', fontSize: 18 }}>💬 Đánh giá (1)</h3>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Đánh giá của bạn</div>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? 'active' : ''}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nhận xét</div>
            <textarea
              className="review-textarea"
              placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              {comment.length}/1000 ký tự
            </div>

            <div className="review-actions">
              <button
                onClick={() => {
                  setRating(0);
                  setComment('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                ✕ Hủy
              </button>
              <button
                onClick={() => alert('Đã gửi đánh giá thành công!')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="sidebar-box">
            <div className="calendar-header">
              <span>Tháng 11 / 2026</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => dispatch(setDate(e.target.value))}
                style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 6px' }}
              />
            </div>

            <div className="calendar-grid">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                <div key={d} className="calendar-day-name">
                  {d}
                </div>
              ))}
              {daysInMonth.map((day) => {
                const dayStr = `2026-11-${day < 10 ? '0' + day : day}`;
                return (
                  <button
                    key={day}
                    className={`calendar-day ${selectedDate === dayStr ? 'active' : ''}`}
                    onClick={() => dispatch(setDate(dayStr))}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-box">
            <h3 style={{ margin: 0, fontSize: 16 }}>Khung giờ - {selectedDate}</h3>

            <div className="legend-row">
              <span className="legend-item">
                <i className="legend-dot dot-free" /> Trống
              </span>
              <span className="legend-item">
                <i className="legend-dot dot-walkin" /> Đặt vãng lai
              </span>
              <span className="legend-item">
                <i className="legend-dot dot-fixed" /> Đặt cố định
              </span>
            </div>

            {loading ? (
              <p style={{ fontSize: 13 }}>Đang tải khung giờ...</p>
            ) : (
              <div className="hour-slots-grid">
                {HOURS_LIST.map((hour) => {
                  const matchedSlot = slots.find((s) => s.startTime === hour);
                  const isBooked = matchedSlot?.isBooked ?? false;
                  const isSelected = startTime === hour;

                  return (
                    <button
                      key={hour}
                      disabled={isBooked}
                      onClick={() => handleHourClick(hour, isBooked)}
                      className={`hour-btn ${isBooked ? 'booked' : ''} ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      {hour} {isBooked ? '📌' : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sidebar-box">
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Chọn giờ đặt sân</h3>

            {message && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 13,
                  backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: message.type === 'success' ? '#166534' : '#991b1b',
                }}
              >
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Giờ bắt đầu <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="time-select"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="">--:00 --</option>
                {HOURS_LIST.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <div className="helper-text">Chỉ cho phép đặt giờ chẵn (VD: 07:00, 08:00...)</div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Giờ kết thúc <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="time-select"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">--:00 --</option>
                {[...HOURS_LIST, '23:00'].map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <div className="helper-text">Chỉ cho phép đặt giờ chẵn (VD: 08:00, 09:00...)</div>
            </div>

            {calculateTotal() > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderTop: '1px solid #f1f5f9',
                  fontWeight: 700,
                }}
              >
                <span>Tạm tính:</span>
                <span style={{ color: '#2563eb' }}>
                  {calculateTotal().toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            <button
              className="btn-book-gradient"
              disabled={!startTime || !endTime}
              onClick={handleBookNow}
            >
              Đặt sân ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}