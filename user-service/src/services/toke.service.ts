import dayjs, { Dayjs } from "dayjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const tokenService = {
    generateToken: (userId: string, role: string, type: string, expires: Dayjs): string => {
        const payload = {
            sub: userId,
            role,
            type,
            exp: expires.unix(),
        };
        return jwt.sign(payload, JWT_SECRET);
    },

    generateTokens: async (id: string, role: string) => {
        const accessExpires = dayjs().add(15, "minute");
        const refreshExpires = dayjs().add(7, "day");

        const accessToken = tokenService.generateToken(id, role, "ACCESS", accessExpires);
        const refreshToken = tokenService.generateToken(id, role, "REFRESH", refreshExpires);

        return {
            accessToken,
            refreshToken,
        };
    },
};
