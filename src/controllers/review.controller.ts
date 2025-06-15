// src/controllers/review.controller.ts
import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../models/review.model';

const reviewService = new ReviewService();

export const addReviewController = async (req: Request, res: Response) => {
    try {
        const placeId = parseInt(req.params.placeId, 10);
        const userId = req.user?.id;
        const reviewData: CreateReviewDto = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Требуется аутентификация' });
        }
        if (isNaN(placeId)) {
            return res.status(400).json({ message: 'Неверный ID метки' });
        }
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            return res.status(400).json({ message: 'Рейтинг должен быть числом от 1 до 5' });
        }

        const newReview = await reviewService.addReview(reviewData, placeId, userId);
        res.status(201).json(newReview);
    } catch (error: any) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Не удалось добавить отзыв', error: error.message });
    }
};

export const getReviewsController = async (req: Request, res: Response) => {
    try {
        const placeId = parseInt(req.params.placeId, 10);
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

         if (isNaN(placeId)) {
            return res.status(400).json({ message: 'Неверный ID метки' });
        }

        const result = await reviewService.getReviewsForPlace(placeId, page, limit);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Не удалось загрузить отзывы', error: error.message });
    }
};