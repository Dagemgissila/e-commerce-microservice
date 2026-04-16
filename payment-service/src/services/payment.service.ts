import { consumer, producer } from "../config/kafka";
import { prisma } from "../../lib/prisma";

export const startPaymentConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({
        topic: "order_created",
        fromBeginning: true,
    });

    console.log("Payment Service listening to Kafka...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const order = JSON.parse(message.value!.toString());

            console.log("Processing payment for order:", order.id);

            try {
                // 1. Create a "PENDING" payment record
                const payment = await prisma.payment.create({
                    data: {
                        orderId: order.id,
                        amount: order.total,
                        status: "PENDING",
                    },
                });

                // 2. Simulate payment logic (e.g., call external gateway)
                const success = true; // In real world, logic goes here

                const finalStatus = success ? "PAID" : "FAILED";

                // 3. Update payment record
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: finalStatus },
                });

                // 4. Send Kafka event
                await producer.send({
                    topic: "payment_processed",
                    messages: [
                        {
                            value: JSON.stringify({
                                orderId: order.id,
                                productId: order.productId,
                                quantity: order.quantity,
                                status: finalStatus,
                            }),
                        },
                    ],
                });

                console.log(`Payment ${finalStatus} for order ${order.id}`);
            } catch (error) {
                console.error("Payment processing error:", error);
            }
        },
    });
};