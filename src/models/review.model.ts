// src/models/review.model.ts
export interface Review {
    id?: number;
    place_id: number;
    user_id: number;
    rating: number;
    comment?: string;
    created_at?: Date;
    created_by_username?: string; // Для отображения имени автора отзыва
}

export interface CreateReviewDto {
    rating: number;
    comment?: string;
}