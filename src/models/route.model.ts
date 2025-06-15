// src/models/route.model.ts
import { Place } from './place.model';

export interface Route {
    id?: number;
    user_id: number;
    name: string;
    description?: string;
    is_public: boolean;
    created_at?: Date;
}

// Для получения полной информации о маршруте с метками
export interface RouteDetails extends Route {
    places: Place[];
}

// DTO для создания маршрута
export interface CreateRouteDto {
    name: string;
    description?: string;
    is_public?: boolean;
    place_ids: number[]; // Упорядоченный массив ID меток
}