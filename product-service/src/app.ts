import express from 'express';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import productRoutes from "./routes/product.routes";
import { internalAuth } from './middleware/internalAuth';

dotenv.config();

const app = express();
app.use(internalAuth)

app.use(express.json());

app.use('/health', healthRouter);
app.use("/api/products", productRoutes);


export default app;
