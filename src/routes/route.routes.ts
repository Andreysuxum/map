// src/routes/route.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  createRouteController,
  getMyRoutesController,
  getRouteDetailsController,
  getPublicRoutesController,
  updateVisibilityController
} from '../controllers/route.controller';

const router = Router();

// --- МАРШРУТЫ ДЛЯ АУТЕНТИФИЦИРОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ ---

// Создание нового маршрута
// POST /api/routes
router.post('/', authenticateToken, createRouteController);

// Получение маршрутов, созданных текущим пользователем
// GET /api/routes/my <-- ИЗМЕНЕНО С "/my-routes" НА "/my"
router.get('/my', authenticateToken, getMyRoutesController); 

// Изменение статуса публичности маршрута
// PATCH /api/routes/:id/visibility
router.patch('/:id/visibility', authenticateToken, updateVisibilityController);


// --- ПУБЛИЧНЫЕ МАРШРУТЫ ---

// Получение списка всех публичных маршрутов
// GET /api/routes/public
router.get('/public', getPublicRoutesController);

// Получение деталей конкретного маршрута (может быть публичным или приватным)
// GET /api/routes/:id
router.get('/:id', getRouteDetailsController);


export default router;