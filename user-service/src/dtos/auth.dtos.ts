import z from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email({ message: "Invalid email address" }).max(25),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});


export const LoginSchema = z.object({
    email: z.email({ message: "Invalid email address" }).max(25),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export type LoginDto = z.infer<typeof LoginSchema>;