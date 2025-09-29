import { Router } from 'express';
import { getPaginatePayment, updatePaymentStatus, countPayments, deletePayment } from '../Controllers/registrationController';

const router = Router();

router.post('/payments/paginate', getPaginatePayment);
router.patch('/paymentsUpdate/:paymentId', updatePaymentStatus);
router.get('/payments/count', countPayments);
router.delete('/payments/:paymentId', deletePayment);

export default router;