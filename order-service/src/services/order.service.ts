import { producer } from "../config/kafka";
import { getProduct } from "../utils/productClient";
import { prisma } from "../../lib/prisma";

export const createOrder = async (data: {
    userId: string;
    productId: string;
    quantity: number;
}) => {
    const product = await getProduct(data.productId);

    if (!product) {
        throw new Error("Product not found");
    }

    if (product.stock < data.quantity) {
        throw new Error("Not enough stock");
    }

    // 2. Create order
    const order = await prisma.order.create({
        data: {
            ...data,
            total: product.price * data.quantity,
        },
    });


    // 3. Send Kafka event
    await producer.send({
        topic: "order_created",
        messages: [
            {
                value: JSON.stringify(order),
            },
        ],
    });

    return order;
};

export const getOrders = async () => {
    return await prisma.order.findMany();
};