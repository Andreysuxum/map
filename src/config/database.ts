// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные из .env

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err: any) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;