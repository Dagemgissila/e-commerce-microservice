import app from "./app";
import { connectProducer } from "./config/kafka";

const PORT = process.env.PORT || 4002;

const start = async () => {
    try {
        await connectProducer();

        app.listen(PORT, () => {
            console.log(`Order service running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start order service:", error);
        process.exit(1);
    }
};

start();