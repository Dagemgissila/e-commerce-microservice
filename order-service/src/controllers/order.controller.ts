import { Request, Response } from "express";
import { createOrder } from "../services/order.service";
import { prisma } from "../../lib/prisma";

export const create = async (req: Request, res: Response) => {
    try {
        const order = await createOrder(req.body);
        res.status(201).json(order);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    const { status } = req.body;

    const order = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { status },
    });

    res.json(order);
};