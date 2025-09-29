import express from 'express';
import { register, login, validateToken } from '../Controllers/authController'
import { validateMembership } from '../Controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/validateLogin', validateToken);
router.post('/validateMembership', validateMembership);
export default router;
