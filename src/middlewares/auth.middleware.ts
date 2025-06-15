// src/middlewares/auth.middleware.ts
// (Убедитесь, что ваш код выглядит примерно так, особенно объявление req.user)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt'; // Убедитесь, что JWT_SECRET импортируется правильно
import { UserAuthPayload } from '../models/user.model'; // Импорт вашего интерфейса

declare global {
    namespace Express {
        interface Request {
            user?: UserAuthPayload; // Должен содержать как минимум { id: number, email: string, ... }
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_STRING

    if (token == null) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => { // user здесь будет payload из токена
        if (err) {
            console.error("JWT verification error:", err.message);
            return res.status(403).json({ message: "Token is not valid" });
        }
        req.user = user as UserAuthPayload; // Приводим к нашему типу
        next();
    });
};