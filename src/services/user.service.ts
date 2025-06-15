// src/services/user.service.ts
import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import ms, { StringValue as MSStringValue } from 'ms'; // Изменено: импортируем StringValue и даем ему псевдоним
import { User, UserAuthPayload } from '../models/user.model';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';


export class UserService {
    async register(userData: Pick<User, 'email' | 'username'> & { password_raw: string }): Promise<{ user: User, token: string }> {
        const { email, username, password_raw } = userData;

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existingUser.rows.length > 0) {
            throw new Error('User with this email or username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password_raw, salt);

        const result = await pool.query(
            'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
            [email, username, password_hash]
        );
        const newUser: User = result.rows[0];

        const tokenPayload: UserAuthPayload = { id: newUser.id!, email: newUser.email, username: newUser.username };

        // Используем утверждение типа для JWT_EXPIRES_IN
        const expiresInMilliseconds = ms(JWT_EXPIRES_IN as MSStringValue); 
        const expiresInSeconds = Math.floor(expiresInMilliseconds / 1000);

        const signOptions: SignOptions = {
            expiresIn: expiresInSeconds
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, signOptions);

        return { user: newUser, token };
    }

    async login(credentials: Pick<User, 'email'> & { password_raw: string }): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
        const { email, password_raw } = credentials;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            throw new Error('Invalid credentials');
        }
        const user: User = result.rows[0];

        const isMatch = await bcrypt.compare(password_raw, user.password_hash!);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const tokenPayload: UserAuthPayload = { id: user.id!, email: user.email, username: user.username };

        // Используем утверждение типа для JWT_EXPIRES_IN
        const expiresInMilliseconds = ms(JWT_EXPIRES_IN as MSStringValue);
        const expiresInSeconds = Math.floor(expiresInMilliseconds / 1000);

        const signOptions: SignOptions = {
            expiresIn: expiresInSeconds
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, signOptions);

        const { password_hash, ...userWithoutPassword } = user; 

        return { user: userWithoutPassword, token };
    }
}