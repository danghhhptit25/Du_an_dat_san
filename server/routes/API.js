import { Router } from 'express';
import bookingRoutes from './bookingRoutes.js';
import statsRoutes from './statsRoutes.js';

const router = Router();

router.use('/bookings', bookingRoutes);
router.use('/stats', statsRoutes);

export default router;