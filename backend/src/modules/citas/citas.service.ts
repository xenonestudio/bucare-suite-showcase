import { citasRepository } from './citas.repository.js';
import { CreateCitaDto, UpdateCitaDto } from './citas.types.js';
import { AppError } from '../../shared/errors/AppError.js';

export class CitasService {
  async createCita(data: CreateCitaDto) {
    return citasRepository.create(data);
  }

  async getAllCitas() {
    return citasRepository.findAll();
  }

  async getCitaById(id: string) {
    const cita = await citasRepository.findById(id);
    if (!cita) throw new AppError('Cita no encontrada', 404);
    return cita;
  }

  async updateCita(id: string, data: UpdateCitaDto) {
    await this.getCitaById(id);
    return citasRepository.update(id, data);
  }

  async deleteCita(id: string) {
    await this.getCitaById(id);
    await citasRepository.delete(id);
  }
}

export const citasService = new CitasService();
