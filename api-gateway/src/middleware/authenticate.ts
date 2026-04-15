import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
    sub: string;
    role: string;
    type: string;
    exp: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized", message: "Missing or invalid Authorization header" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (payload.type !== "ACCESS") {
            res.status(401).json({ error: "Unauthorized", message: "Invalid token type" });
            return;
        }

        // Forward user identity to downstream services as headers
        req.headers["x-user-id"] = payload.sub;
        req.headers["x-user-role"] = payload.role;

        next();
    } catch (err) {
        res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    }
};
