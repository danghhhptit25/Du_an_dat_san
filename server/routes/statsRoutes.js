import { Router } from 'express';
import { getBookingHistory, getRevenueStats } from '../controllers/statsController.js';

const router = Router();

router.get('/revenue', getRevenueStats);
router.get('/history', getBookingHistory);

export default router;