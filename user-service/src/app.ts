import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { userRouter } from './routes/user.routes';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/v1/user', userRouter);

export default app;
