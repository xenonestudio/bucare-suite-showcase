import { z } from 'zod';

export const createCitaSchema = z.object({
  body: z.object({
    clienteId: z.string().uuid("El ID de cliente es inválido"),
    fecha: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha inválida" }),
    tipoPropiedad: z.enum(["APARTAMENTO", "LOCAL"], {
      errorMap: () => ({ message: "Tipo de propiedad debe ser APARTAMENTO o LOCAL" })
    }),
    notas: z.string().optional(),
  })
});

export const updateCitaSchema = z.object({
  body: z.object({
    estado: z.enum(["PROGRAMADA", "COMPLETADA", "CANCELADA"]).optional(),
    fecha: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
    tipoPropiedad: z.enum(["APARTAMENTO", "LOCAL"]).optional(),
    notas: z.string().optional(),
  })
});
