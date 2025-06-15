// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import authRoutes from './routes/auth.routes';
import placeRoutes from './routes/place.routes';
// import pool from './config/database'; // Можно импортировать для проверки соединения при старте

import routeRoutes from './routes/route.routes'; // <-- ДОБАВИТЬ ЭТОТ ИМПОРТ
import guideRoutes from './routes/guide.routes';
import routingRoutes from './routes/routing.routes';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Разрешает CORS-запросы (настройте более строго для продакшена!)
app.use(express.json()); // Для парсинга JSON тел запросов
app.use(express.urlencoded({ extended: true })); // Для парсинга URL-encoded тел
app.use('/api/guides', guideRoutes);
// Проверка соединения с БД (опционально, но полезно)
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Database connection error', err.stack);
//   } else {
//     console.log('Database connected:', res.rows[0].now);
//   }
// });
app.use('/api/routing', routingRoutes);
// --- ДОБАВЬТЕ ЭТУ СТРОКУ ---
// Делаем папку 'uploads' публичной, чтобы Flutter мог загружать из нее картинки
app.use('/uploads', express.static('uploads'));
// --- КОНЕЦ ИЗМЕНЕНИЯ ---
// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Map App Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/routes', routeRoutes); // <-- ДОБАВИТЬ ЭТУ СТРОКУ

// Глобальный обработчик ошибок (простой пример)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});