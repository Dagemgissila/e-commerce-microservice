import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ service: 'order-service', status: 'OK' });
});

export { router as healthRouter };
