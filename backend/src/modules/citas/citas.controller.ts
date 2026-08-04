import { Request, Response, NextFunction } from 'express';
import { citasService } from './citas.service.js';

export class CitasController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cita = await citasService.createCita(req.body);
      res.status(201).json({ success: true, data: cita });
    } catch (error) {
      next(error);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const citas = await citasService.getAllCitas();
      res.json({ success: true, data: citas });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const cita = await citasService.updateCita(id, req.body);
      res.json({ success: true, data: cita });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await citasService.deleteCita(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const citasController = new CitasController();
