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

export const getAll = async (req: Request, res: Response) => {
    const { category } = req.query;
    const orders = await prisma.order.findMany({
        where: category ? { category: category as string } : {},
        orderBy: { category: "asc" },
    });
    res.json(orders);
};


export const updateStatus = async (req: Request, res: Response) => {
    const { status } = req.body;

    const order = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { status },
    });

    res.json(order);
};