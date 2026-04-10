import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import productRoutes from "./routes/product.routes";

dotenv.config();

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use("/api/products", productRoutes);


export default app;
