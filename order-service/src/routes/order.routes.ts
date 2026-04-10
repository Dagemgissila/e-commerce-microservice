import express from "express";
import { create, updateStatus } from "../controllers/order.controller";
import { prisma } from "../../lib/prisma";

const router = express.Router();

router.post("/", create);
router.put("/:id", updateStatus);

router.get("/", async (req, res) => {
    const orders = await prisma.order.findMany();
    res.json(orders);
});

export default router;