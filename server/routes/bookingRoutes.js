import { Router } from 'express';
import {
  createBooking,
  getAvailableSlots,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';

const router = Router();

router.post('/', createBooking);
router.get('/available-slots', getAvailableSlots); // phải đặt TRƯỚC '/:id'
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

export default router;