import Booking from '../models/Booking.js';

export const getBookingHistory = async (req, res, next) => {
  try {
    const { customerId, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      data: bookings,
      pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueStats = async (req, res, next) => {
  try {
    const { from, to, groupBy = 'court' } = req.query;

    const match = { status: 'Confirmed' };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to) match.date.$lte = to;
    }

    const groupKey =
      groupBy === 'day' ? '$date'
      : groupBy === 'month' ? { $substr: ['$date', 0, 7] }
      : '$courtId';

    const stats = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupKey,
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: groupBy === 'court' ? { totalRevenue: -1 } : { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};