// src/models/user.model.ts
export interface User {
    id?: number;
    username?: string;
    email: string;
    password_hash?: string; // Для передачи на бэкенд при регистрации, но не для ответа клиенту
    created_at?: Date;
}

export interface UserAuthPayload { // Для JWT токена
    id: number;
    email: string;
    username?: string;
}