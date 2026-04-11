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
    // USER SERVICE: Map /api/users to /api/v1/user
    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.USER_SERVICE,
            pathFilter: "/api/users",
            pathRewrite: {
                "^/api/users": "/api/v1/user",
            },
        })
    );

    // PRODUCT SERVICE: Map /api/products to /api/products
    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PRODUCT_SERVICE,
            pathFilter: "/api/products",
        })
    );

    // ORDER SERVICE: Map /api/orders to /api/orders
    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.ORDER_SERVICE,
            pathFilter: "/api/orders",
        })
    );

    // PAYMENT SERVICE: Map /api/payments to /api/payments
    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PAYMENT_SERVICE,
            pathFilter: "/api/payments",
        })
    );
};