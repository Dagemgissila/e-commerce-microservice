import { consumer } from "../config/kafka";
import { prisma } from "../../lib/prisma";

export const startInventoryConsumer = async () => {
    await consumer.subscribe({
        topic: "payment_processed",
        fromBeginning: true,
    });

    console.log("Product Service inventory consumer listening to Kafka...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const payload = JSON.parse(message.value!.toString());
                const { orderId, productId, quantity, status } = payload;

                if (status !== "PAID") {
                    console.log(`Payment for order ${orderId} failed or pending. Skipping stock update.`);
                    return;
                }

                console.log(`Decrementing stock for product ${productId} by ${quantity} for order ${orderId}`);

                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        stock: {
                            decrement: quantity
                        }
                    }
                });

                console.log("Stock successfully updated.");
            } catch (error) {
                console.error("Error processing inventory update:", error);
            }
        },
    });
};
