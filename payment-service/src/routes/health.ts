import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ service: 'payment-service', status: 'OK' });
});

export { router as healthRouter };
