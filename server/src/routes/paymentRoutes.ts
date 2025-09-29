import express from 'express';
import { submitUserPayment, getAllPending, verifyPaymentById, getUserPaymentHistory } from '../Controllers/paymentController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const router = express.Router();
router.post('/submit', authenticate, submitUserPayment);
router.get('/pending', authenticate, authorizeAdmin, getAllPending);
router.post('/verify/:id', authenticate, authorizeAdmin, verifyPaymentById);
router.get('/history/:userId', getUserPaymentHistory);

export default router;