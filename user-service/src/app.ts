import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { internalAuth } from './middleware/internalAuth';
import { MainRoutes } from './routes/main.routes';

dotenv.config();

const app = express();

app.use(internalAuth);
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/users', MainRoutes);

export default app;
