import app from './app';
import { connectKafka } from "./config/kafka";
import { startInventoryConsumer } from "./services/inventory.consumer";

const PORT = process.env.PORT || 4001;

const start = async () => {
    try {
        await connectKafka();
        await startInventoryConsumer();

        app.listen(PORT, () => {
            console.log(`Product service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start product-service:", error);
    }
};

start();
