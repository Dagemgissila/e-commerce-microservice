import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ service: 'product-service', status: 'OK' });
});

export { router as healthRouter };
