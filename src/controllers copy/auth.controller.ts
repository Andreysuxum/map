// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

const userService = new UserService();

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const { user, token } = await userService.register({ email, username, password_raw: password });
        // Не отправляем хэш пароля обратно
        const { password_hash, ...userResponse } = user;
        res.status(201).json({ user: userResponse, token });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Registration failed' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
         if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const { user, token } = await userService.login({ email, password_raw: password });
        res.status(200).json({ user, token });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Login failed' });
    }
};