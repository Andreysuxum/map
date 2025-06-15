// src/services/route.service.ts
import pool from '../config/database';
import { Route, RouteDetails, CreateRouteDto } from '../models/route.model';
import { Place } from '../models/place.model';

export class RouteService {
  // Создание нового маршрута
  async createRoute(routeData: CreateRouteDto, userId: number): Promise<Route> {
    const { name, description, is_public = false, place_ids } = routeData;

    // Используем транзакцию, т.к. нужно сделать несколько вставок
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Вставляем сам маршрут
      const routeInsertQuery = `
        INSERT INTO routes (user_id, name, description, is_public) 
        VALUES ($1, $2, $3, $4) RETURNING *`;
      const routeResult = await client.query(routeInsertQuery, [userId, name, description, is_public]);
      const newRoute: Route = routeResult.rows[0];

      // 2. Вставляем метки маршрута в связующую таблицу
      if (place_ids && place_ids.length > 0) {
        // Создаем массив промисов для вставки всех меток
        const placeInsertPromises = place_ids.map((placeId, index) => {
          const routePlaceInsertQuery = `
            INSERT INTO route_places (route_id, place_id, order_in_route) VALUES ($1, $2, $3)`;
          return client.query(routePlaceInsertQuery, [newRoute.id, placeId, index]);
        });
        // Выполняем все промисы
        await Promise.all(placeInsertPromises);
      }

      await client.query('COMMIT');
      return newRoute;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // Получение всех маршрутов пользователя
  async getRoutesForUser(userId: number): Promise<Route[]> {
    const result = await pool.query('SELECT * FROM routes WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  // Получение деталей одного маршрута
  async getRouteDetails(routeId: number): Promise<RouteDetails | null> {
    // 1. Получаем основную информацию о маршруте
    const routeResult = await pool.query('SELECT * FROM routes WHERE id = $1', [routeId]);
    if (routeResult.rows.length === 0) {
      return null;
    }
    const route: Route = routeResult.rows[0];

    // 2. ИСПРАВЛЕННЫЙ ЗАПРОС для получения меток
    // Мы явно перечисляем столбцы и используем ST_Y/ST_X для координат
    const placesQuery = `
      SELECT 
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.created_at,
        rp.order_in_route,
        ST_Y(p.coordinates::geometry) as latitude,   -- Извлекаем широту
        ST_X(p.coordinates::geometry) as longitude  -- Извлекаем долготу
      FROM places p
      JOIN route_places rp ON p.id = rp.place_id
      WHERE rp.route_id = $1
      ORDER BY rp.order_in_route ASC;
    `;
    const placesResult = await pool.query(placesQuery, [routeId]);
    // Теперь placesResult.rows будет содержать поля latitude и longitude
    const places: Place[] = placesResult.rows;

    return { ...route, places };
  }

  // Получение всех публичных маршрутов
  async getPublicRoutes(): Promise<Route[]> {
    const result = await pool.query('SELECT * FROM routes WHERE is_public = TRUE ORDER BY created_at DESC');
    return result.rows;
  }

  // Обновление статуса публичности маршрута
  async updateRouteVisibility(routeId: number, userId: number, isPublic: boolean): Promise<Route> {
    const query = `
      UPDATE routes SET is_public = $1 
      WHERE id = $2 AND user_id = $3 
      RETURNING *`;
    const result = await pool.query(query, [isPublic, routeId, userId]);
    if (result.rows.length === 0) {
      throw new Error('Маршрут не найден или у вас нет прав на его изменение');
    }
    return result.rows[0];
  }
}