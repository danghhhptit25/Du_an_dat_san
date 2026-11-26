import { formatCurrency } from '../utils/format';

export interface RevenueChartItem {
  label: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  items: RevenueChartItem[];
}

export default function RevenueChart({ items }: RevenueChartProps) {
  if (items.length === 0) {
    return <p className="revenue-chart__empty">Chưa có dữ liệu doanh thu trong khoảng thời gian này.</p>;
  }

  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1);

  return (
    <ul className="revenue-chart" aria-label="Biểu đồ doanh thu">
      {items.map((item) => {
        const percent = Math.round((item.revenue / maxRevenue) * 100);

        return (
          <li key={item.label} className="revenue-chart__row">
            <span className="revenue-chart__label">{item.label}</span>
            <div className="revenue-chart__track">
              <div className="revenue-chart__bar" style={{ width: `${percent}%` }} />
            </div>
            <span className="revenue-chart__value">
              {formatCurrency(item.revenue)}
              <span className="revenue-chart__sub"> ({item.bookings} lượt)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
