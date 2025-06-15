// src/config/multer.config.ts
import multer from 'multer';
import path from 'path';

// Настраиваем, куда сохранять файлы и как их называть
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 'uploads/' - это папка в корне вашего бэкенд-проекта. Создайте ее.
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла, чтобы избежать конфликтов
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов, чтобы принимать только изображения
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB
  },
  fileFilter: fileFilter
});