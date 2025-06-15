// src/routes/guide.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
    applyToBeGuideController,
    updateGuideProfileController,
    getAllGuidesController,
    getGuideProfileController
} from '../controllers/guide.controller';

const router = Router();

// Подать заявку на статус гида (защищено)
router.post('/apply', authenticateToken, applyToBeGuideController);

// Обновить свой профиль гида (защищено)
router.put('/profile', authenticateToken, updateGuideProfileController);

// Получить список всех гидов (публично)
router.get('/', getAllGuidesController);

// Получить публичный профиль одного гида по ID (публично)
router.get('/:id', getGuideProfileController);

export default router;