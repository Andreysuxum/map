// src/controllers/place.controller.ts
import { Request, Response } from 'express';
import { PlaceService } from '../services/place.service';
import { CreatePlaceDto } from '../models/place.model';
import { upload } from '../config/multer.config'; // <-- Импор
const placeService = new PlaceService();


export const createPlaceController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    // Мы получаем все данные из тела запроса
    const placeData = req.body; 

    // Проверяем наличие обязательных полей
    if (!placeData.name || placeData.latitude == null || placeData.longitude == null) {
        return res.status(400).json({ message: 'Name, latitude, и longitude обязательны' });
    }

    const newPlace = await placeService.createPlace(placeData, userId);
    res.status(201).json(newPlace);
  } catch (error: any) {
    console.error('Error creating place:', error);
    res.status(500).json({ message: 'Не удалось создать метку', error: error.message });
  }
};

export const getAllPlacesController = async (req: Request, res: Response) => {
    try {
        const places = await placeService.getAllPlaces();
        res.status(200).json(places);
    } catch (error: any) {
        console.error('Error fetching all places:', error);
        res.status(500).json({ message: 'Failed to fetch places', error: error.message });
    }
};

export const getPlaceByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid place ID format' });
        }
        const place = await placeService.getPlaceById(id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.status(200).json(place);
    } catch (error: any) {
        console.error('Error fetching place by ID:', error);
        res.status(500).json({ message: 'Failed to fetch place', error: error.message });
    }
};

export const getMyPlacesController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const places = await placeService.getPlacesByUserId(userId);
        res.status(200).json(places);
    } catch (error: any) {
        console.error('Error fetching user places:', error);
        res.status(500).json({ message: 'Failed to fetch user places', error: error.message });
    }
};


export const uploadPhotoController = async (req: Request, res: Response) => {
    try {
        const placeId = parseInt(req.params.id, 10);
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }
        
        const imageUrl = req.file.path.replace(/\\/g, "/");
        
        await placeService.addPhotoToPlace(placeId, imageUrl);
        res.status(201).json({ message: 'Фото добавлено', imageUrl: imageUrl });

    } catch (e: any) {
        console.error("Error uploading photo:", e);
        res.status(500).json({ message: 'Ошибка загрузки фото', error: e.message });
    }
};