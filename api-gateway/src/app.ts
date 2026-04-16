import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { setupRoutes } from "./routes";

import { globalRateLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();

app.use(globalRateLimiter);
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// setup routing
setupRoutes(app);

// health check
app.get("/health", (req, res) => {
    res.json({ service: "api-gateway", status: "UP" });
});

export default app;