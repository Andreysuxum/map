// src/services/review.service.ts
import pool from '../config/database';
import { Review, CreateReviewDto } from '../models/review.model';

export class ReviewService {
  // Добавление нового отзыва с пересчетом среднего рейтинга метки
  async addReview(reviewData: CreateReviewDto, placeId: number, userId: number): Promise<Review> {
    const { rating, comment } = reviewData;

    // Начинаем транзакцию
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Вставляем новый отзыв
      const insertReviewQuery = `
        INSERT INTO reviews (place_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, place_id, user_id, rating, comment, created_at
      `;
      const newReviewResult = await client.query(insertReviewQuery, [placeId, userId, rating, comment]);
      const newReview: Review = newReviewResult.rows[0];

      // 2. Пересчитываем средний рейтинг и количество отзывов для этой метки
      const updateRatingQuery = `
        WITH place_stats AS (
          SELECT
            AVG(rating) as avg_r,
            COUNT(id) as count_r
          FROM reviews
          WHERE place_id = $1
        )
        UPDATE places
        SET
          average_rating = (SELECT avg_r FROM place_stats),
          number_of_reviews = (SELECT count_r FROM place_stats)
        WHERE id = $1;
      `;
      await client.query(updateRatingQuery, [placeId]);

      // 3. Если все успешно, подтверждаем транзакцию
      await client.query('COMMIT');
      return newReview;
    } catch (e: any) {
      // 4. Если произошла ошибка, откатываем все изменения
      await client.query('ROLLBACK');
      // Если ошибка связана с уникальным ключом (повторный отзыв)
      if (e.code === '23505') { // Код ошибки для unique_violation
        throw new Error('Вы уже оставляли отзыв на это место.');
      }
      throw e; // Перебрасываем другие ошибки
    } finally {
      // 5. Всегда освобождаем клиента обратно в пул
      client.release();
    }
  }

  // Получение отзывов для метки с пагинацией
  async getReviewsForPlace(placeId: number, page: number = 1, limit: number = 10): Promise<{reviews: Review[], total: number}> {
    const offset = (page - 1) * limit;

    // Запрос для получения самих отзывов
    const reviewsQuery = `
      SELECT
        r.id, r.place_id, r.user_id, r.rating, r.comment, r.created_at,
        u.username as created_by_username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.place_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const reviewsResult = await pool.query(reviewsQuery, [placeId, limit, offset]);

    // Запрос для получения общего количества отзывов (для пагинации на фронтенде)
    const totalQuery = 'SELECT COUNT(*) FROM reviews WHERE place_id = $1';
    const totalResult = await pool.query(totalQuery, [placeId]);
    const total = parseInt(totalResult.rows[0].count, 10);

    return {
        reviews: reviewsResult.rows as Review[],
        total: total
    };
  }
}