import { consumer } from "../../config/kafka";
import { prisma } from "../../../lib/prisma";

export const startPaymentConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({
        topic: "payment_processed",
        fromBeginning: true,
    });

    console.log("Order Service listening to Kafka...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const payload = JSON.parse(message.value!.toString());
                const { orderId, status } = payload;

                console.log(`Updating order ${orderId} status to ${status} via Kafka`);

                await prisma.order.update({
                    where: { id: orderId },
                    data: { status },
                });

                console.log("Order status updated successfully");
            } catch (error) {
                console.error("Error processing payment event:", error);
            }
        },
    });
};