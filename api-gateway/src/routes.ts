import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { Request, Response } from "express";

const proxyOptions: Options = {
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            // Can add headers or logging here if needed
        },
        error: (err, req, res: any) => {
            console.error("Proxy Error:", err);
            res.status(500).json({
                message: "Proxy Error",
                error: err.message
            });
        },
    }
};

export const setupRoutes = (app: any) => {
    // USER SERVICE
    app.use(
        "/api/users",
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.USER_SERVICE,
        })
    );

    // PRODUCT SERVICE
    app.use(
        "/api/products",
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PRODUCT_SERVICE,
        })
    );

    // ORDER SERVICE
    app.use(
        "/api/orders",
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.ORDER_SERVICE,
        })
    );

    // PAYMENT SERVICE
    app.use(
        "/api/payments",
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PAYMENT_SERVICE,
        })
    );
};