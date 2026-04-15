import { prisma } from "../../lib/prisma";
import { LoginDto, RegisterDto } from "../dtos/auth.dtos";
import bcrypt from "bcrypt";
const createUser = async (data: RegisterDto) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    })

    if (user) {
        throw new Error("User already exists");
    }
    const { password, ...rest } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.user.create({
        data: { ...rest, password: hashedPassword },
    });
};

const login = async (data: LoginDto) => {
    const { email, password } = data;
    const user = await prisma.user.findUnique({
        where: { email }
    })
    if (!user) {
        throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    return user;
}

export const AuthService = {
    createUser,
    login
};