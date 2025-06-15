// src/services/guide.service.ts

import pool from '../config/database';
import { GuideProfile, GuideProfileDto, PublicGuideProfile } from '../models/guide.model';

export class GuideService {
  async applyToBeGuide(userId: number, profileData: GuideProfileDto): Promise<GuideProfile> {
    const { bio, languages, city } = profileData;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Обновляем статус пользователя в таблице users
      await client.query('UPDATE users SET is_guide = TRUE WHERE id = $1', [userId]);

      // 2. Создаем или обновляем профиль гида
      const query = `
        INSERT INTO guide_profiles (user_id, bio, languages, city, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          bio = EXCLUDED.bio,
          languages = EXCLUDED.languages,
          city = EXCLUDED.city,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      // --- ИСПРАВЛЕНИЕ: Убрана лишняя запятая в конце массива ---
      const result = await client.query(query, [userId, bio, languages, city]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      console.error("DATABASE ERROR in applyToBeGuide:", e); // Добавляем лог ошибки БД
      throw e;
    } finally {
      client.release();
    }
  }

  // ... (остальные методы: updateGuideProfile, getAllGuides, getGuideProfile без изменений)
  async updateGuideProfile(userId: number, profileData: GuideProfileDto): Promise<GuideProfile> {
    const { bio, languages, city } = profileData;
    const query = `
      UPDATE guide_profiles SET
        bio = COALESCE($1, bio), languages = COALESCE($2, languages),
        city = COALESCE($3, city), updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4 RETURNING *;
    `;
    const result = await pool.query(query, [bio, languages, city, userId]);
    if (result.rows.length === 0) {
      throw new Error('Профиль гида не найден для обновления.');
    }
    return result.rows[0];
  }

  async getAllGuides(): Promise<PublicGuideProfile[]> {
    const query = `
      SELECT u.id as user_id, u.username, u.email, u.is_guide,
             gp.bio, gp.languages, gp.city
      FROM users u JOIN guide_profiles gp ON u.id = gp.user_id
      WHERE u.is_guide = TRUE;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async getGuideProfile(userId: number): Promise<PublicGuideProfile | null> {
    const query = `
      SELECT u.id as user_id, u.username, u.email, u.is_guide,
             gp.bio, gp.languages, gp.city
      FROM users u LEFT JOIN guide_profiles gp ON u.id = gp.user_id
      WHERE u.id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.length === 0 ? null : result.rows[0];
  }
}