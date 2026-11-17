import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { clearCart } from '../store/bookingSlice';
import './CheckoutBookingPage.css';

interface AddonItem {
  id: string;
  name: string;
  price: number;
}

const ADDON_ITEMS: AddonItem[] = [
  { id: 'nuoc_suoi', name: 'Nước suối', price: 10000 },
  { id: 'ao_bib', name: 'Áo bib (bộ 10 chiếc)', price: 40000 },
  { id: 'trong_tai', name: 'Trọng tài', price: 150000 },
];

export default function CheckoutBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { selectedCourtId, selectedDate, cartSlots } = useAppSelector(
    (state) => state.booking
  );

  const bookingInfo = location.state || {
    courtId: selectedCourtId || 'san_bong_A',
    courtName: 'Sân 5 người số 1',
    sport: 'Bóng đá mini',
    dateLabel: 'Thứ Sáu, 27/11/2026',
    date: selectedDate || '2026-11-27',
    startTime: cartSlots[0]?.startTime || '06:30',
    endTime: cartSlots[cartSlots.length - 1]?.endTime || '07:30',
    courtPrice:
      cartSlots.reduce((sum, s) => sum + s.price, 0) || 250000,
  };

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [playerCount, setPlayerCount] = useState(10);
  const [note, setNote] = useState('');

  const [quantities, setQuantities] = useState<Record<string, number>>({
    nuoc_suoi: 0,
    ao_bib: 0,
    trong_tai: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState<'at_court' | 'deposit'>('at_court');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const addonsTotal = ADDON_ITEMS.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || 0),
    0
  );
  const grandTotal = bookingInfo.courtPrice + addonsTotal;
  const depositAmount = Math.round(bookingInfo.courtPrice * 0.3);

  const handleConfirmOrder = async () => {
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Họ và tên và Số điện thoại để sân xác nhận!');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const payload = {
      customerId: 'user_01',
      customerName: fullName,
      phone,
      playerCount,
      note,
      courtId: bookingInfo.courtId,
      date: bookingInfo.date,
      startTime: bookingInfo.startTime,
      endTime: bookingInfo.endTime,
      addons: ADDON_ITEMS.filter((i) => quantities[i.id] > 0).map((i) => ({
        name: i.name,
        quantity: quantities[i.id],
        price: i.price,
      })),
      paymentMethod,
      totalPrice: grandTotal,
    };

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Không thể tạo đơn đặt sân!');
        setSubmitting(false);
        return;
      }

      dispatch(clearCart());
      alert('Đặt sân thành công!');
      navigate('/history');
    } catch {
      setErrorMsg('Lỗi kết nối tới máy chủ Backend (cổng 5000)!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        <div>
          <h1 className="checkout-main-title">THÔNG TIN VÀ DỤNG CỤ</h1>
          <p className="checkout-subtitle">
            Sân dùng thông tin này để xác nhận với bạn và chuẩn bị đồ thuê.
          </p>

          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: 13.5,
                marginBottom: 16,
              }}
            >
              {errorMsg}
            </div>
          )}

          <div className="form-row-2">
            <div>
              <label className="checkout-label">Họ và tên</label>
              <input
                type="text"
                className="checkout-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="checkout-label">Số điện thoại</label>
              <input
                type="tel"
                className="checkout-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="checkout-field">
            <label className="checkout-label">
              Số người chơi <span>(tối đa 14)</span>
            </label>
            <input
              type="number"
              min={1}
              max={14}
              className="checkout-input checkout-input-half"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
            />
          </div>

          <div className="checkout-field">
            <label className="checkout-label">
              Ghi chú cho sân <span>(không bắt buộc)</span>
            </label>
            <textarea
              className="checkout-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <h2 className="checkout-section-title">THUÊ DỤNG CỤ VÀ ĐỒ UỐNG</h2>
          <div className="addon-list">
            {ADDON_ITEMS.map((item) => {
              const qty = quantities[item.id] || 0;
              return (
                <div key={item.id} className="addon-row">
                  <div>
                    <div className="addon-name">{item.name}</div>
                    <div className="addon-price">
                      {item.price.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div className="stepper-group">
                    <button
                      type="button"
                      className="stepper-btn"
                      disabled={qty === 0}
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      −
                    </button>
                    <span className="stepper-count">{qty}</span>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="checkout-section-title">HÌNH THỨC THANH TOÁN</h2>
          <div className="payment-grid">
            <label
              className={`payment-card ${paymentMethod === 'at_court' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('at_court')}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="payment-radio"
                checked={paymentMethod === 'at_court'}
                onChange={() => setPaymentMethod('at_court')}
              />
              <div>
                <div className="payment-title">Thanh toán tại sân</div>
                <div className="payment-desc">
                  Trả tiền mặt hoặc chuyển khoản khi đến chơi.
                </div>
              </div>
            </label>

            <label
              className={`payment-card ${paymentMethod === 'deposit' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('deposit')}
            >
              <input
                type="radio"
                name="paymentMethod"
                className="payment-radio"
                checked={paymentMethod === 'deposit'}
                onChange={() => setPaymentMethod('deposit')}
              />
              <div>
                <div className="payment-title">Chuyển khoản cọc</div>
                <div className="payment-desc">
                  Cọc 30% tiền sân để giữ chỗ; sân gửi thông tin tài khoản qua điện thoại.
                </div>
              </div>
            </label>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="btn-submit-order"
              disabled={submitting}
              onClick={handleConfirmOrder}
            >
              {submitting ? 'Đang xử lý...' : 'Xem lại đơn đặt sân'}
            </button>
          </div>
        </div>

        <div className="summary-card">
          <h2 className="summary-title">LƯỢT ĐẶT CỦA BẠN</h2>
          <span className="sport-pill">{bookingInfo.sport}</span>

          <div className="summary-info-line">{bookingInfo.courtName}</div>
          <div className="summary-info-line">{bookingInfo.dateLabel}</div>
          <div className="summary-info-line">
            {bookingInfo.startTime} - {bookingInfo.endTime}
          </div>

          <hr className="summary-divider" />

          <div className="summary-row">
            <span>Tiền sân</span>
            <span className="summary-row-value">
              {bookingInfo.courtPrice.toLocaleString('vi-VN')} đ
            </span>
          </div>

          {ADDON_ITEMS.filter((i) => quantities[i.id] > 0).map((item) => (
            <div key={item.id} className="summary-row">
              <span>
                {item.name} × {quantities[item.id]}
              </span>
              <span className="summary-row-value">
                {(item.price * quantities[item.id]).toLocaleString('vi-VN')} đ
              </span>
            </div>
          ))}

          <hr className="summary-divider" />

          <div className="summary-total-row">
            <span className="summary-total-label">Tổng cộng</span>
            <span className="summary-total-price">
              {grandTotal.toLocaleString('vi-VN')} đ
            </span>
          </div>

          {paymentMethod === 'deposit' && (
            <div className="deposit-note">
              <span>Cần chuyển cọc trước (30%):</span>
              <strong>{depositAmount.toLocaleString('vi-VN')} đ</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}