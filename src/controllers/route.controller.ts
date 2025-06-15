// src/controllers/route.controller.ts

import { Request, Response } from 'express';
import { RouteService } from '../services/route.service';
import { CreateRouteDto } from '../models/route.model';

const routeService = new RouteService();

export const createRouteController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    const routeData: CreateRouteDto = req.body;
    if (!routeData.name || !routeData.place_ids || routeData.place_ids.length < 2) {
      return res.status(400).json({ message: 'Название и минимум две метки обязательны' });
    }

    const newRoute = await routeService.createRoute(routeData, userId);
    res.status(201).json(newRoute);
  } catch (error: any) {
    console.error('Error creating route:', error);
    res.status(500).json({ message: 'Не удалось создать маршрут', error: error.message });
  }
};

export const getMyRoutesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    const routes = await routeService.getRoutesForUser(userId);
    res.status(200).json(routes);
  } catch (error: any) {
    console.error('Error fetching user routes:', error);
    res.status(500).json({ message: 'Не удалось загрузить маршруты', error: error.message });
  }
};

export const getRouteDetailsController = async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    if (isNaN(routeId)) {
      return res.status(400).json({ message: 'Неверный ID маршрута' });
    }

    const routeDetails = await routeService.getRouteDetails(routeId);
    if (!routeDetails) {
      return res.status(404).json({ message: 'Маршрут не найден' });
    }
    
    // Здесь можно добавить проверку, является ли маршрут публичным или принадлежит ли он текущему пользователю
    // if (!routeDetails.is_public && routeDetails.user_id !== req.user?.id) {
    //   return res.status(403).json({ message: 'Доступ запрещен' });
    // }

    res.status(200).json(routeDetails);
  } catch (error: any) {
    console.error('Error fetching route details:', error);
    res.status(500).json({ message: 'Не удалось загрузить детали маршрута', error: error.message });
  }
};

export const getPublicRoutesController = async (req: Request, res: Response) => {
    try {
        const publicRoutes = await routeService.getPublicRoutes();
        res.status(200).json(publicRoutes);
    } catch (error: any) {
        console.error('Error fetching public routes:', error);
        res.status(500).json({ message: 'Не удалось загрузить публичные маршруты', error: error.message });
    }
};

export const updateVisibilityController = async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const { is_public } = req.body;

    if (isNaN(routeId)) {
      return res.status(400).json({ message: 'Неверный ID маршрута' });
    }
    if (typeof is_public !== 'boolean') {
      return res.status(400).json({ message: 'Поле is_public должно быть true или false' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    const updatedRoute = await routeService.updateRouteVisibility(routeId, userId, is_public);
    res.status(200).json(updatedRoute);
  } catch (error: any) {
    console.error('Error updating route visibility:', error);
    res.status(500).json({ message: 'Не удалось обновить статус маршрута', error: error.message });
  }
};