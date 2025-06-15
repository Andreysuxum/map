// test-jwt.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Убедитесь, что .env файл загружается

const testSecret = process.env.JWT_SECRET || 'fallback_test_secret';
const testPayload = { id: 123, name: 'Test User' };
const testExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

console.log('--- Test JWT Generation ---');
console.log('Test Secret:', testSecret);
console.log('Test Expires In:', testExpiresIn);

try {
    // @ts-ignore
    const token = jwt.sign(testPayload, testSecret, { expiresIn: testExpiresIn });
    console.log('SUCCESS: Test JWT generated:', token);
} catch (error: any) { // Добавил any для типа ошибки, чтобы избежать TS7034
    console.error('ERROR: Test JWT generation failed:', error.message);
    console.error('Stack:', error.stack);
}
console.log('--- End Test JWT Generation ---');