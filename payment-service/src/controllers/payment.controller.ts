import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getAll = async (req: Request, res: Response) => {
    const payments = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(payments);
};

export const getOne = async (req: Request, res: Response) => {
    const payment = await prisma.payment.findUnique({
        where: { id: req.params.id as string },
    });
    res.json(payment);
};
