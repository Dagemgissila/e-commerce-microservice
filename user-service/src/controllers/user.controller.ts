import { Request, Response } from "express";
import { createUser } from "../services/user.service";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body);
        res.json(user);
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "User creation failed", details: err instanceof Error ? err.message : err });
    }
};