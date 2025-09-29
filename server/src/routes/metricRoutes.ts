import express from 'express';
import { metrics }  from "../Controllers/metricController";
import { authorizeAdmin } from '../middlewares/authMiddleware';
const router = express.Router();


router.post('/metrics', authorizeAdmin, metrics);

export default router;