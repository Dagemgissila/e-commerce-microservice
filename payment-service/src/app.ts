import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/health', healthRouter);

export default app;
