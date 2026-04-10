import app from "./app";
import { startPaymentConsumer } from "./services/payment.service";

const PORT = process.env.PORT || 4003;

const start = async () => {
  await startPaymentConsumer();

  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
};

start();