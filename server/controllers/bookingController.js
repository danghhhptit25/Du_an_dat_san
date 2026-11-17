import booking from '../models/booking.js';

export const createBooking = async (req, res) => {
  try {
    const { customerId, courtId, date, startTime, endTime, totalPrice } = req.body;

    if (!customerId || !courtId || !date || !startTime || !endTime || !totalPrice) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đặt sân.' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' });
    }

    const conflictBooking = await booking.findOne({
      courtId,
      date,
      status: { $ne: 'Cancelled' },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictBooking) {
      return res.status(409).json({
        message: `Khung giờ bị trùng với đơn đã đặt (${conflictBooking.startTime} - ${conflictBooking.endTime}).`,
      });
    }

    const newBooking = await booking.create({
      customerId,
      courtId,
      date,
      startTime,
      endTime,
      totalPrice,
    });

    res.status(201).json({ message: 'Đặt sân thành công!', data: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo đơn', error: error.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({ message: 'Thiếu tham số courtId hoặc date.' });
    }

    const bookedList = await booking.find({
      courtId,
      date,
      status: { $ne: 'Cancelled' },
    });

    const slots = [];
    const defaultPrice = 150000;

    for (let hour = 7; hour < 22; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00`;
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

      const isBooked = bookedList.some(
        (b) => b.startTime < endTime && b.endTime > startTime
      );

      slots.push({ startTime, endTime, price: defaultPrice, isBooked });
    }

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy lịch trống', error: error.message });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const { customerId, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      booking.countDocuments(filter),
    ]);

    res.status(200).json({
      data: bookings,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử', error: error.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const stats = await booking.aggregate([
      { $match: { status: 'Confirmed' } },
      {
        $group: {
          _id: '$courtId',
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi thống kê', error: error.message });
  }
};