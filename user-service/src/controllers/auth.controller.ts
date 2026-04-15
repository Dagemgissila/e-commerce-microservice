import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginDto } from "../dtos/auth.dtos";
import { tokenService } from "../services/toke.service";


const registerUser = async (req: Request, res: Response) => {
    try {
        const user = await AuthService.createUser(req.body);
        const { accessToken, refreshToken } = await tokenService.generateTokens(user.id, user.role);
        res.json({ user, accessToken, refreshToken });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "User creation failed", details: err instanceof Error ? err.message : err });
    }
};

const loginUser = async (req: Request<{}, {}, LoginDto>, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await AuthService.login({ email, password });
        const { accessToken, refreshToken } = await tokenService.generateTokens(user.id, user.role);
        res.json({ user, accessToken, refreshToken });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(401).json({ error: "Login failed", details: err instanceof Error ? err.message : err });
    }
}

export const AuthController = {
    registerUser,
    loginUser
};