import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
    clientId: "order-service",
    brokers: [process.env.KAFKA_BROKER!]
});

export const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

export const consumer = kafka.consumer({
    groupId: "order-group"
});

export const connectProducer = async () => {
    let connected = false;
    while (!connected) {
        try {
            await producer.connect();
            console.log("Kafka Producer Connected");
            connected = true;

            // Pre-create topic
            const admin = kafka.admin();
            await admin.connect();
            await admin.createTopics({
                waitForLeaders: true,
                topics: [
                    {
                        topic: "order_created",
                        numPartitions: 3,
                        replicationFactor: 1,
                    },
                ],
            });
            await admin.disconnect();
            console.log("Kafka Topic Created/Verified");
        } catch (error) {
            console.log("Waiting for Kafka to be ready...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};




