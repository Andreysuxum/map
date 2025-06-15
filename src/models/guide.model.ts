// src/models/guide.model.ts

export interface GuideProfile {
  user_id: number;
  bio?: string;
  languages?: string;
  city?: string;
}

// Эта модель будет использоваться для получения полного публичного профиля
export interface PublicGuideProfile {
  user_id: number;
  username: string;
  email: string; // Или можно скрыть, на ваше усмотрение
  is_guide: boolean;
  bio?: string;
  languages?: string;
  city?: string;
}

// DTO для создания/обновления профиля гида
export interface GuideProfileDto {
  bio?: string;
  languages?: string;
  city?: string;
}