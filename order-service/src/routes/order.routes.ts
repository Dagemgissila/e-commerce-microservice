import express from "express";
import { create, getAll, updateStatus } from "../controllers/order.controller";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.put("/:id", updateStatus);


export default router;