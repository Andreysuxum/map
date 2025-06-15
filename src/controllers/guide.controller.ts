// src/controllers/guide.controller.ts
import { Request, Response } from 'express';
import { GuideService } from '../services/guide.service';

const guideService = new GuideService();

export const applyToBeGuideController = async (req: Request, res: Response) => {
    // --- ДОБАВЛЕНА ОТЛАДКА ---
    console.log('[API CALL] /guides/apply - Received body:', req.body);
    // --- КОНЕЦ ОТЛАДКИ ---
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Требуется аутентификация' });

        const profile = await guideService.applyToBeGuide(userId, req.body);
        res.status(201).json(profile);
    } catch (e: any) {
        console.error("[CONTROLLER ERROR] applyToBeGuideController:", e.message);
        res.status(500).json({ message: 'Ошибка при подаче заявки', error: e.message });
    }
};

// ... (остальные контроллеры: updateGuideProfileController, getAllGuidesController, getGuideProfileController без изменений)
export const updateGuideProfileController = async (req: Request, res: Response) => {
     try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Требуется аутентификация' });

        const profile = await guideService.updateGuideProfile(userId, req.body);
        res.status(200).json(profile);
    } catch (e: any) {
        res.status(500).json({ message: 'Ошибка обновления профиля', error: e.message });
    }
};

export const getAllGuidesController = async (req: Request, res: Response) => {
    try {
        const guides = await guideService.getAllGuides();
        res.status(200).json(guides);
    } catch (e: any) {
        res.status(500).json({ message: 'Ошибка получения списка гидов', error: e.message });
    }
};

export const getGuideProfileController = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if(isNaN(userId)) return res.status(400).json({ message: 'Неверный ID пользователя' });

        const profile = await guideService.getGuideProfile(userId);
        if (!profile) return res.status(404).json({ message: 'Профиль не найден' });
        
        res.status(200).json(profile);
    } catch (e: any) {
        res.status(500).json({ message: 'Ошибка получения профиля', error: e.message });
    }
};