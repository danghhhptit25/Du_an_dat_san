import Booking from '../models/Booking.js';

export const createBooking = async (req, res, next) => {
  try {
    const { customerId, courtId, date, startTime, endTime, totalPrice } = req.body;

    if (!customerId || !courtId || !date || !startTime || !endTime || !totalPrice) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đặt sân.' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' });
    }

    const conflict = await Booking.findOne({
      courtId,
      date,
      status: { $ne: 'Cancelled' },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json({
        message: `Khung giờ bị trùng với đơn đã đặt (${conflict.startTime} - ${conflict.endTime}).`,
      });
    }

    const newBooking = await Booking.create({
      customerId, courtId, date, startTime, endTime, totalPrice,
    });

    res.status(201).json({ message: 'Đặt sân thành công!', data: newBooking });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({ message: 'Thiếu tham số courtId hoặc date.' });
    }

    const bookedList = await Booking.find({
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
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const found = await Booking.findById(req.params.id);
    if (!found) return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    res.status(200).json(found);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    res.status(200).json({ message: 'Đã hủy đơn.', data: updated });
  } catch (error) {
    next(error);
  }
};