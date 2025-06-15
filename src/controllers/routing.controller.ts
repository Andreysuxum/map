// src/controllers/routing.controller.ts
import { Request, Response } from 'express';
import { RoutingService } from '../services/routing.service';

const routingService = new RoutingService();

export const getRouteController = async (req: Request, res: Response) => {
  try {
    const { points, profile } = req.body;
    if (!points || points.length < 2 || !profile) {
      return res.status(400).json({ message: 'Требуются минимум 2 точки и профиль (car, foot, bicycle)' });
    }
    const route = await routingService.getRoute(points, profile);
    res.status(200).json(route);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};