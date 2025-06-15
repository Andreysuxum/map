// src/config/jwt.ts
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET: string = process.env.JWT_SECRET || 'your_super_secret_jwt_key_at_least_32_characters_long_and_random';
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}