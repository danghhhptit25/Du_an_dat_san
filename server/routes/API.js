import express from 'express';
import {
  createBooking,
  getAvailableSlots,
  getBookingHistory,
  getRevenueStats,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/available', getAvailableSlots);
router.get('/history', getBookingHistory);
router.get('/stats', getRevenueStats);

export default router;