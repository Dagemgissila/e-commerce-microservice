import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import orderRoutes from "./routes/order.routes";
dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use('/health', healthRouter);

export default app;
