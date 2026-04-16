import { createProxyMiddleware, Options, fixRequestBody } from "http-proxy-middleware";
import { authenticate } from "./middleware/authenticate";
import { authorize } from "./middleware/authorize";

const addInternalHeader = (proxyReq: any) => {
    proxyReq.setHeader("x-internal-secret", process.env.INTERNAL_SECRET);
};

const proxyOptions: Options = {
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            addInternalHeader(proxyReq);
            if ((req as any).body) {
                fixRequestBody(proxyReq, req as any);
            }
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
    // Public: register & login
    // 1. Apply Authentication/Authorization to relevant paths
    app.use("/api/orders", authenticate);
    app.use("/api/payments", authenticate);
    
    // For products, only protect POST, PUT, DELETE
    app.use("/api/products", (req: any, res: any, next: any) => {
        if (req.method === "GET") return next();
        authenticate(req, res, () => {
             // For simplicity, I'll combine authorize here or use multiple app.use
             // But keep it clean for now.
             next();
        });
    });

    // Special case for products authorization (can be optimized but let's fix pathing first)
    app.post("/api/products", authorize("ADMIN", "USER"));
    app.put("/api/products/:id", authorize("ADMIN", "USER"));
    app.delete("/api/products/:id", authorize("ADMIN"));

    // 2. Global Proxy Middleware (Preserve Paths)
    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.USER_SERVICE,
            pathFilter: "/api/users",
        })
    );

    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PRODUCT_SERVICE,
            pathFilter: "/api/products",
        })
    );

    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.ORDER_SERVICE,
            pathFilter: "/api/orders",
        })
    );

    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PAYMENT_SERVICE,
            pathFilter: "/api/payments",
        })
    );
};