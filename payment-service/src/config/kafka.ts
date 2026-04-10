import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "payment-service",
    brokers: [process.env.KAFKA_BROKER!]
});

export const consumer = kafka.consumer({
    groupId: "payment-group",
});



