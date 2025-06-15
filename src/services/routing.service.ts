// src/services/routing.service.ts
import axios from 'axios';
import { LatLng } from '../models/lat-lng.model'; // Измените путь на новый файл

export class RoutingService {
  async getRoute(points: LatLng[], profile: 'car' | 'foot' | 'bicycle'): Promise<any> {
    // ВНИМАНИЕ: ИСПРАВЬТЕ ЭТИ СТРОКИ
    // БЫЛО НЕПРАВИЛЬНО:
    // const coordsString = points.map(p => `<span class="math-inline">\{p\.longitude\},</span>{p.latitude}`).join(';');
    // const url = `http://router.project-osrm.org/route/v1/<span class="math-inline">\{osrmProfile\}/</span>{coordsString}?overview=full&geometries=polyline`;

    // ДОЛЖНО БЫТЬ ПРАВИЛЬНО:
    const coordsString = points.map(p => `${p.longitude},${p.latitude}`).join(';');

    // Профиль OSRM для разного транспорта
    const osrmProfile = profile === 'car' ? 'driving' : profile;

    // URL публичного демо-сервера OSRM
    const url = `http://router.project-osrm.org/route/v1/${osrmProfile}/${coordsString}?overview=full&geometries=polyline`;


    try {
      const response = await axios.get(url);
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        // Возвращаем самое важное - закодированную геометрию маршрута
        return { geometry: response.data.routes[0].geometry };
      } else {
        throw new Error('Маршрут не найден');
      }
    } catch (error: any) {
      console.error('OSRM request failed:', error.response?.data || error.message);
      throw new Error('Ошибка при построении маршрута');
    }
  }
}