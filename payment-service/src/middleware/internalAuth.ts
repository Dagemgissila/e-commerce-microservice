import { Request, Response, NextFunction } from "express";

export const internalAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const internalSecret = process.env.INTERNAL_SECRET;
    const requestSecret = req.headers["x-internal-secret"];

    if (!internalSecret) {
        console.error("CRITICAL: INTERNAL_SECRET is not defined in the environment.");
        return res.status(500).json({
            error: "Internal Server Error: Secure communication misconfigured",
        });
    }

    if (requestSecret !== internalSecret) {
        return res.status(403).json({
            error: "Access Forbidden: Direct access to microservices is strictly prohibited. Requests must originate from the API Gateway.",
        });
    }

    next();
};
