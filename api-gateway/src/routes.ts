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
    app.use(
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.USER_SERVICE,
            pathFilter: "/api/users",
        })
    );

    // Public: GET (browse products)
    app.get(
        "/api/products",
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PRODUCT_SERVICE,
            pathFilter: "/api/products",
        })
    );
    app.get(
        "/api/products/:id",
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PRODUCT_SERVICE,
        })
    );

    // Protected: create/update (ADMIN or USER), delete (ADMIN only)
    app.post(
        "/api/products",
        authenticate,
        authorize("ADMIN", "USER"),
        createProxyMiddleware({ ...proxyOptions, target: process.env.PRODUCT_SERVICE })
    );
    app.put(
        "/api/products/:id",
        authenticate,
        authorize("ADMIN", "USER"),
        createProxyMiddleware({ ...proxyOptions, target: process.env.PRODUCT_SERVICE })
    );
    app.delete(
        "/api/products/:id",
        authenticate,
        authorize("ADMIN"),
        createProxyMiddleware({ ...proxyOptions, target: process.env.PRODUCT_SERVICE })
    );

    // All order routes require authentication
    app.use(
        "/api/orders",
        authenticate,
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.ORDER_SERVICE,
            pathFilter: "/api/orders",
        })
    );

    // All payment routes require authentication
    app.use(
        "/api/payments",
        authenticate,
        createProxyMiddleware({
            ...proxyOptions,
            target: process.env.PAYMENT_SERVICE,
            pathFilter: "/api/payments",
        })
    );
};