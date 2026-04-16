import { consumer, producer } from "../config/kafka";

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
                // simulate payment logic
                const success = true;

                if (success) {
                    await producer.send({
                        topic: "payment_processed",
                        messages: [
                            {
                                value: JSON.stringify({
                                    orderId: order.id,
                                    productId: order.productId,
                                    quantity: order.quantity,
                                    status: "PAID",
                                }),
                            },
                        ],
                    })

                    console.log("Payment successful");
                } else {
                    await producer.send({
                        topic: "payment_processed",
                        messages: [
                            {
                                value: JSON.stringify({
                                    orderId: order.id,
                                    productId: order.productId,
                                    quantity: order.quantity,
                                    status: "FAILED",
                                }),
                            },
                        ],
                    });
                    console.log("Payment failed");
                }
            } catch (error) {
                console.error("Payment failed:", error);
            }
        },
    });
};