// src/services/place.service.ts
import pool from '../config/database';
import { Place, CreatePlaceDto } from '../models/place.model';

export class PlaceService {
    /**
     * Создает новую метку в базе данных.
     * @param placeData Данные для создания метки (name, description, latitude, longitude)
     * @param userId ID пользователя, создающего метку
     * @returns Созданная метка с извлеченными lat/lon
     */
    async createPlace(placeData: any, userId: number): Promise<Place> {
        // Мы получаем все нужные поля из DTO
        const { name, description, latitude, longitude } = placeData; 
        
        // ЗАПРОС ИСПРАВЛЕН:
        // 1. Вставляем данные в столбец "coordinates", а не в "latitude", "longitude".
        // 2. Используем ST_MakePoint(longitude, latitude) для создания точки типа geography.
        const query = `
            INSERT INTO places (user_id, name, description, coordinates)
            VALUES ($1, $2, $3, ST_MakePoint($4, $5)::geography) 
            RETURNING id, user_id, name, description, created_at, 
                      ST_Y(coordinates::geometry) as latitude, 
                      ST_X(coordinates::geometry) as longitude;
        `;
        
        // ПАРАМЕТРЫ ИСПРАВЛЕНЫ:
        // Передаем longitude ($4) и latitude ($5) в соответствии с порядком в ST_MakePoint.
        const result = await pool.query(query, [userId, name, description, longitude, latitude]);
        return result.rows[0];
    }
    
    /**
     * Получает все метки из базы данных.
     * @returns Массив всех меток с информацией о создателе.
     */
    async getAllPlaces(): Promise<Place[]> {
        // ST_X/ST_Y извлекают долготу/широту из типа GEOGRAPHY (после приведения к GEOMETRY)
        // Присоединяем таблицу users, чтобы получить имя пользователя
        const query = `
            SELECT 
                p.id, p.user_id, p.name, p.description, p.created_at,
                ST_Y(p.coordinates::geometry) as latitude,   -- Широта
                ST_X(p.coordinates::geometry) as longitude,  -- Долгота
                u.username as created_by  -- Имя пользователя из таблицы users
            FROM 
                places p
            LEFT JOIN 
                users u ON p.user_id = u.id
            ORDER BY 
                p.created_at DESC;
        `;
        const result = await pool.query(query);
        return result.rows as Place[];
    }

    /**
     * Получает метку по её ID.
     * @param id ID метки
     * @returns Объект метки или null, если не найдена.
     */
    async getPlaceById(id: number): Promise<Place | null> {
        const query = `
            SELECT 
                p.id, p.user_id, p.name, p.description, p.created_at,
                ST_Y(p.coordinates::geometry) as latitude,
                ST_X(p.coordinates::geometry) as longitude,
                u.username as created_by
            FROM 
                places p
            LEFT JOIN 
                users u ON p.user_id = u.id
            WHERE 
                p.id = $1;
        `;
        const result = await pool.query(query, [id]);
        return result.rows.length > 0 ? (result.rows[0] as Place) : null;
    }

    /**
     * Получает все метки, созданные конкретным пользователем.
     * @param userId ID пользователя
     * @returns Массив меток пользователя.
     */
    async getPlacesByUserId(userId: number): Promise<Place[]> {
        const query = `
            SELECT 
                p.id, p.user_id, p.name, p.description, p.created_at,
                ST_Y(p.coordinates::geometry) as latitude,
                ST_X(p.coordinates::geometry) as longitude,
                u.username as created_by 
            FROM 
                places p
            LEFT JOIN 
                users u ON p.user_id = u.id 
            WHERE 
                p.user_id = $1
            ORDER BY 
                p.created_at DESC;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows as Place[];
    }

    async getPlaceDetails(id: number): Promise<any | null> {
        const placeResult = await pool.query('SELECT * FROM places WHERE id = $1', [id]);
        if (placeResult.rows.length === 0) return null;
        
        const place = placeResult.rows[0];

        const reviewsResult = await pool.query('SELECT * FROM reviews WHERE place_id = $1 ORDER BY created_at DESC', [id]);
        const reviews = reviewsResult.rows;

        const photosResult = await pool.query('SELECT id, image_url FROM place_photos WHERE place_id = $1 ORDER BY created_at ASC', [id]);
        const photoUrls = photosResult.rows.map((row: { image_url: any; }) => row.image_url);

        return { ...place, reviews, photoUrls };
    }

    async addPhotoToPlace(placeId: number, imageUrl: string): Promise<{ message: string }> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query('INSERT INTO place_photos (place_id, image_url) VALUES ($1, $2)', [placeId, imageUrl]);
            
            const coverResult = await client.query('SELECT cover_image_url FROM places WHERE id = $1', [placeId]);
            if (!coverResult.rows[0].cover_image_url) {
                await client.query('UPDATE places SET cover_image_url = $1 WHERE id = $2', [imageUrl, placeId]);
            }
            
            await client.query('COMMIT');
            return { message: "Фото успешно добавлено" };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

}