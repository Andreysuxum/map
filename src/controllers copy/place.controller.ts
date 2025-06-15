// src/controllers/place.controller.ts
import { Request, Response } from 'express';
import { PlaceService } from '../services/place.service.js';
import { Place } from '../models/place.model.js';

const placeService = new PlaceService();

export const createPlace = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id; // Получаем ID пользователя из токена (через authMiddleware)
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { name, description, latitude, longitude } = req.body;
        if (!name || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'Name, latitude, and longitude are required' });
        }

        const placeData: Omit<Place, 'id' | 'user_id' | 'created_at' | 'coordinates' | 'created_by'> = {
            name,
            description,
            latitude,
            longitude,
        };
        const newPlace = await placeService.createPlace(placeData, userId);
        res.status(201).json(newPlace);
    } catch (error: any) {
        console.error("Error creating place:", error);
        res.status(500).json({ message: error.message || 'Failed to create place' });
    }
};

export const getAllPlaces = async (req: Request, res: Response) => {
    try {
        const places = await placeService.getAllPlaces();
        res.status(200).json(places);
    } catch (error: any) {
        console.error("Error fetching all places:", error);
        res.status(500).json({ message: error.message || 'Failed to fetch places' });
    }
};

export const getPlaceById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid place ID' });
        }
        const place = await placeService.getPlaceById(id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found' });
        }
        res.status(200).json(place);
    } catch (error: any) {
        console.error("Error fetching place by ID:", error);
        res.status(500).json({ message: error.message || 'Failed to fetch place' });
    }
};

export const getMyPlaces = async (req: Request, res: Response) => { // Получение меток текущего пользователя
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const places = await placeService.getPlacesByUserId(userId);
        res.status(200).json(places);
    } catch (error: any) {
        console.error("Error fetching user's places:", error);
        res.status(500).json({ message: error.message || "Failed to fetch user's places" });
    }
};