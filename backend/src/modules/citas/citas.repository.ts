import { prisma } from '../../config/database.config.js';
import { CreateCitaDto, UpdateCitaDto } from './citas.types.js';

export class CitasRepository {
  async create(data: CreateCitaDto) {
    return prisma.cita.create({
      data: {
        clienteId: data.clienteId,
        fecha: new Date(data.fecha),
        tipoPropiedad: data.tipoPropiedad,
        notas: data.notas,
      },
      include: {
        cliente: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return prisma.cita.findMany({
      orderBy: { fecha: 'asc' },
      include: {
        cliente: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.cita.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateCitaDto) {
    const updateData: any = { ...data };
    if (data.fecha) updateData.fecha = new Date(data.fecha);

    return prisma.cita.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.cita.delete({
      where: { id },
    });
  }
}

export const citasRepository = new CitasRepository();
