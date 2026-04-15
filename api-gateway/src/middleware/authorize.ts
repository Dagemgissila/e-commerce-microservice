import { Request, Response, NextFunction } from "express";

/**
 * Role-based authorization middleware.
 * Must be used AFTER the `authenticate` middleware.
 * @param allowedRoles - list of roles that are permitted (e.g. ["ADMIN", "SELLER"])
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.headers["x-user-role"] as string;

        if (!userRole) {
            res.status(403).json({ error: "Forbidden", message: "No role information found" });
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                error: "Forbidden",
                message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
            });
            return;
        }

        next();
    };
};
