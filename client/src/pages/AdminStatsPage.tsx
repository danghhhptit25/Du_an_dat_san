import { useEffect, useState } from 'react';
import './AdminStatsPage.css';

interface BookingRecord {
  _id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  paymentMethod?: 'at_court' | 'deposit';
  customerName?: string;
}

const SPORTS_LIST = [
  { key: 'Bóng đá mini', matchIds: ['san_bong_A', 'san_bong_B'] },
  { key: 'Pickleball', matchIds: ['san_pickleball_1'] },
  { key: 'Tennis', matchIds: ['san_tennis_1'] },
  { key: 'Cầu lông', matchIds: ['san_cau_long_1'] },
];

export default function AdminStatsPage() {
  const [period, setPeriod] = useState<'today' | '7days'>('today');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/bookings');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.bookings || [];
        setBookings(list);
      } catch {
        setBookings([
          {
            _id: 'demo_1',
            courtId: 'san_pickleball_1',
            date: '2026-11-18',
            startTime: '18:00',
            endTime: '19:00',
            totalPrice: 80000,
            status: 'Pending',
            paymentMethod: 'at_court',
            customerName: 'Hoàng Hữu Hải Đăng',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const validBookings = bookings.filter((b) => {
    if (b.status === 'Cancelled') return false;
    if (period === 'today') {
      return b.date === '2026-11-18';
    }
    return true;
  });

  const confirmedBookings = validBookings.filter((b) => b.status === 'Confirmed');
  const pendingBookings = validBookings.filter((b) => b.status === 'Pending');

  const collectedRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const expectedRevenue = pendingBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalCount = validBookings.length;

  const maxSportTotal = Math.max(
    1,
    ...SPORTS_LIST.map((sp) =>
      validBookings
        .filter((b) => sp.matchIds.includes(b.courtId))
        .reduce((sum, b) => sum + b.totalPrice, 0)
    )
  );

  const cashBookings = confirmedBookings.filter(
    (b) => (b.paymentMethod || 'at_court') === 'at_court'
  );
  const transferBookings = confirmedBookings.filter(
    (b) => b.paymentMethod === 'deposit'
  );

  const cashRevenue = cashBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const transferRevenue = transferBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const maxMethodRevenue = Math.max(1, cashRevenue, transferRevenue);

  return (
    <div className="stats-wrapper">
      <div className="stats-container">
        <div className="stats-header">
          <h1 className="stats-title">Doanh thu</h1>

          <div className="period-switch">
            <button
              type="button"
              className={`period-btn ${period === 'today' ? 'active' : ''}`}
              onClick={() => setPeriod('today')}
            >
              Hôm nay
            </button>
            <button
              type="button"
              className={`period-btn ${period === '7days' ? 'active' : ''}`}
              onClick={() => setPeriod('7days')}
            >
              7 ngày gần nhất
            </button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card primary">
            <div className="kpi-label">Đã thu</div>
            <div className="kpi-value">
              {collectedRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Dự kiến sẽ thu</div>
            <div className="kpi-value">
              {expectedRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Số lượt</div>
            <div className="kpi-value">
              {totalCount}
              <span className="kpi-subtext">
                ({confirmedBookings.length} đã hoàn thành)
              </span>
            </div>
          </div>
        </div>

        <div className="breakdown-grid">
          <div className="stats-box">
            <h2 className="box-heading">THEO MÔN</h2>

            {SPORTS_LIST.map((sport) => {
              const sportItems = validBookings.filter((b) =>
                sport.matchIds.includes(b.courtId)
              );
              const collected = sportItems
                .filter((b) => b.status === 'Confirmed')
                .reduce((sum, b) => sum + b.totalPrice, 0);
              const expected = sportItems
                .filter((b) => b.status === 'Pending')
                .reduce((sum, b) => sum + b.totalPrice, 0);

              const totalSport = collected + expected;
              const widthPercent =
                totalSport > 0 ? Math.max(8, (totalSport / maxSportTotal) * 100) : 0;

              return (
                <div key={sport.key} className="progress-item">
                  <div className="progress-top">
                    <span className="progress-name">{sport.key}</span>
                    <span className="progress-meta">
                      Đã thu {collected.toLocaleString('vi-VN')} đ, dự kiến{' '}
                      {expected.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${collected > 0 ? 'confirmed' : ''}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="stats-box">
            <h2 className="box-heading">THEO HÌNH THỨC THU</h2>

            <div className="progress-item">
              <div className="progress-top">
                <span className="progress-name">Tiền mặt</span>
                <span className="progress-meta">
                  {cashRevenue.toLocaleString('vi-VN')} đ, {cashBookings.length} lượt
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill confirmed"
                  style={{
                    width: `${
                      cashRevenue > 0 ? (cashRevenue / maxMethodRevenue) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-top">
                <span className="progress-name">Chuyển khoản</span>
                <span className="progress-meta">
                  {transferRevenue.toLocaleString('vi-VN')} đ,{' '}
                  {transferBookings.length} lượt
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill confirmed"
                  style={{
                    width: `${
                      transferRevenue > 0
                        ? (transferRevenue / maxMethodRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="stats-box">
          <h2 className="box-heading">CÁC LƯỢT ĐÃ HOÀN THÀNH</h2>

          {loading ? (
            <p className="completed-empty">Đang tải dữ liệu thống kê...</p>
          ) : confirmedBookings.length === 0 ? (
            <p className="completed-empty">
              Chưa có lượt nào hoàn thành trong khoảng này.
            </p>
          ) : (
            <div className="completed-table-wrap">
              <table className="completed-table">
                <thead>
                  <tr>
                    <th>Mã sân</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Khung giờ</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedBookings.map((item) => (
                    <tr key={item._id}>
                      <td>{item.courtId}</td>
                      <td>{item.customerName || 'Khách đặt online'}</td>
                      <td>{item.date}</td>
                      <td>
                        {item.startTime} - {item.endTime}
                      </td>
                      <td style={{ fontWeight: 700, color: '#1d4ed8' }}>
                        {item.totalPrice.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="stats-footnote">
          Dữ liệu thống kê được tổng hợp trực tiếp từ hệ thống quản lý đặt sân.
        </p>
      </div>
    </div>
  );
}