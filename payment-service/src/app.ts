import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import paymentRoutes from './routes/payment.routes';
import { internalAuth } from './middleware/internalAuth';

dotenv.config();

const app = express();

app.use(internalAuth);
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/payments', paymentRoutes);

export default app;
