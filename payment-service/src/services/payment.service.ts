import { consumer } from "../config/kafka";
import { updateOrderStatus } from "../utils/orderClient";

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
                    await updateOrderStatus(order.id, "PAID");
                    console.log("Payment successful");
                } else {
                    await updateOrderStatus(order.id, "FAILED");
                }
            } catch (error) {
                console.error("Payment failed:", error);
            }
        },
    });
};