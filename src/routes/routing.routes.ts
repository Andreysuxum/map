// src/routes/routing.routes.ts
import { Router } from 'express';
import { getRouteController } from '../controllers/routing.controller';

const router = Router();
router.post('/', getRouteController);
export default router;