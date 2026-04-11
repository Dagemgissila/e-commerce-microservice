import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { internalAuth } from './middleware/internalAuth';

dotenv.config();

const app = express();

app.use(internalAuth);
app.use(express.json());

app.use('/health', healthRouter);

export default app;
