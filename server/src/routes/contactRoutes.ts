import { submitContact } from "../Controllers/contactController";
import express from 'express';


const router = express.Router();

router.post('/submitContact', submitContact);

export default router;