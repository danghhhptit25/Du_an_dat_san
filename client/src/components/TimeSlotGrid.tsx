import type { Slot } from '../types/booking';
import { formatCurrency, todayString } from '../utils/format';

interface TimeSlotGridProps {
  slots: Slot[];
  date: string; 
  selectedStartTimes: string[]; 
  loading?: boolean;
  onToggle: (slot: Slot) => void;
}

type SlotState = 'available' | 'selected' | 'booked' | 'past';

const STATE_LABEL: Record<SlotState, string> = {
  available: 'Còn trống',
  selected: 'Đã chọn',
  booked: 'Đã đặt',
  past: 'Đã qua',
};

function isPast(date: string, startTime: string): boolean {
  const today = todayString();
  if (date < today) return true;
  if (date > today) return false;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return startTime <= `${hours}:${minutes}`;
}

function getSlotState(slot: Slot, date: string, selectedStartTimes: string[]): SlotState {
  if (slot.isBooked) return 'booked';
  if (isPast(date, slot.startTime)) return 'past';
  if (selectedStartTimes.includes(slot.startTime)) return 'selected';
  return 'available';
}

export default function TimeSlotGrid({
  slots,
  date,
  selectedStartTimes,
  loading = false,
  onToggle,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <p className="slot-grid__message" role="status">
        Đang tải lịch trống...
      </p>
    );
  }

  if (slots.length === 0) {
    return <p className="slot-grid__message">Chưa có khung giờ nào cho ngày này.</p>;
  }

  const legend: SlotState[] = ['available', 'selected', 'booked', 'past'];

  return (
    <div className="slot-grid">
      <ul className="slot-grid__legend" aria-label="Chú thích">
        {legend.map((state) => (
          <li key={state} className="slot-grid__legend-item">
            <span className={`slot-grid__swatch slot-grid__swatch--${state}`} aria-hidden="true" />
            {STATE_LABEL[state]}
          </li>
        ))}
      </ul>

      <div className="slot-grid__list">
        {slots.map((slot) => {
          const state = getSlotState(slot, date, selectedStartTimes);
          const disabled = state === 'booked' || state === 'past';

          return (
            <button
              key={slot.startTime}
              type="button"
              className={`slot slot--${state}`}
              disabled={disabled}
              aria-pressed={state === 'selected'}
              onClick={() => onToggle(slot)}
            >
              <span className="slot__time">
                {slot.startTime} - {slot.endTime}
              </span>
              <span className="slot__meta">
                {state === 'available' ? formatCurrency(slot.price) : STATE_LABEL[state]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
