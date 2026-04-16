import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
    clientId: "product-service",
    brokers: [process.env.KAFKA_BROKER!]
});

export const consumer = kafka.consumer({
    groupId: "product-group",
});

export const connectKafka = async () => {
    let connected = false;
    while (!connected) {
        try {
            await consumer.connect();
            console.log("Kafka Consumer Connected (Product Service)");
            connected = true;
        } catch (error) {
            console.log("Waiting for Kafka to be ready...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};
