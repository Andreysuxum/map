// src/models/place.model.ts
export interface Place {
    id?: number;
    user_id: number;        // ID пользователя, создавшего метку
    name: string;
    description?: string;
    latitude: number;       // Для приема с фронтенда и отправки на фронтенд
    longitude: number;      // Для приема с фронтенда и отправки на фронтенд
    // Поле 'coordinates' (тип GEOGRAPHY) мы будем обрабатывать на уровне БД,
    // а для API использовать latitude/longitude.
    created_at?: Date;
    created_by?: string;     // Имя/email пользователя, для отображения (получим через JOIN)
}

// Для создания метки с фронтенда
export interface CreatePlaceDto {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
}