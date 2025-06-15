// src/routes/place.routes.ts
import { Router } from 'express';
import {
    createPlaceController,
    getAllPlacesController,
    getPlaceByIdController,
    uploadPhotoController,
    getMyPlacesController

} from '../controllers/place.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { addReviewController, getReviewsController } from '../controllers/review.controller';
import { upload } from '../config/multer.config';
const router = Router();

// POST /api/places - Создание новой метки (защищено)
router.post('/', authenticateToken, createPlaceController);

// GET /api/places - Получение всех меток (можно сделать публичным или защитить)
// Для примера оставим публичным, но можно добавить authenticateToken, если все метки приватны
router.get('/', getAllPlacesController);

// GET /api/places/my-places - Получение меток текущего пользователя (защищено)
router.get('/my-places', authenticateToken, getMyPlacesController);

// GET /api/places/:id - Получение метки по ID (можно сделать публичным или защитить)
router.get('/:id', getPlaceByIdController);
// --- МАРШРУТЫ ДЛЯ ОТЗЫВОВ ---
// Добавление отзыва к конкретной метке (защищено)
router.post('/:placeId/reviews', authenticateToken, addReviewController);

// Получение отзывов для конкретной метки (публично)
router.get('/:placeId/reviews', getReviewsController);
// Новый эндпоинт для загрузки фото
// upload.single('photo') - мидлвэр, который принимает 1 файл из поля 'photo'
router.post('/:id/photos', authenticateToken, upload.single('photo'), uploadPhotoController);

export default router;
