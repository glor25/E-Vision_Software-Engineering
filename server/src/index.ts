import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';
import videoRoutes from './routes/videoRoutes';
import contactRoutes from './routes/contactRoutes';
import metricRoutes from './routes/metricRoutes';
import userRoutes from './routes/userRoutes';
import registRoutes from './routes/registrationRoutes';
import { communityRouter } from './routes/communityRoutes';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', paymentRoutes);
app.use('/',videoRoutes);
app.use('/',contactRoutes);
app.use('/', metricRoutes);
app.use('/', userRoutes);
app.use('/', registRoutes);
app.use('/', communityRouter)


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`access at http://localhost:${port}`)
});
